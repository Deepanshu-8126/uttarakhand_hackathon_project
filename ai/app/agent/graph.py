"""
Discovery Uttarakhand - LangGraph Agent (GOD-MODE: AGENTIC & UI-CONTROLLING)
Features: Chain-of-Thought, Tool Forcing, Context Locking, UI Action Generation.
"""
import asyncio
import json
import re
from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from .state import AgentState
from .entities import extract_entities_from_text
from .intent import classify_intents
from .planner import analyze_slots, plan_tools
from ..tools import (
    get_weather, plan_route, get_road_advisory,
    calculate_budget, find_stays, explore_destination
)
from ..rag.retriever import retrieve_knowledge
from ..llm.resolver import resolve_provider

CHECKPOINTER = MemorySaver()

# --- 1. UNDERSTAND NODE (Context Locking) ---
async def understand_node(state: Dict[str, Any]) -> Dict[str, Any]:
    msg = state.get("user_message", "")
    
    # LOCK CONTEXT: Pass existing state so entity extractor knows we are already talking about a place
    ctx = {
        "destination": state.get("destination"),
        "origin": state.get("origin"),
        "duration_days": state.get("duration_days"),
        "budget": state.get("budget")
    }
    
    extracted = extract_entities_from_text(msg, ctx)
    intents = classify_intents(msg, extracted, ctx)
    
    updates = {
        "intents": intents,
        "primary_intent": intents[0] if intents else "GENERAL_CHAT"
    }
    
    # SMART MERGE: Only update destination if it's a clear new request
    for k, v in extracted.items():
        if v is not None:
            # Prevent accidental destination overwrite on follow-up questions (e.g. "dharamshala", "boat ride")
            if k == "destination" and state.get("destination"):
                # Only update if user explicitly says "trip to X", "chalo X", "jana hai X", or if word length >= 4 and not a follow-up amenity
                explicit_switch = bool(re.search(r"\b(chalo|jana hai|jaana hai|trip to|plan for|explore|ab|shift to|instead of)\b", msg, re.IGNORECASE))
                if explicit_switch:
                    updates[k] = v
                elif len(str(v)) < 4:
                    pass
            else:
                updates[k] = v

    return updates

# --- 2. SLOT ANALYSIS NODE ---
async def slot_analysis_node(state: Dict[str, Any]) -> Dict[str, Any]:
    intents = state.get("intents", [])
    missing = analyze_slots(intents, state)
    return {"missing_slots": missing}

# --- 3. TOOL EXECUTION NODE (REAL EXECUTION) ---
async def tool_execution_node(state: Dict[str, Any]) -> Dict[str, Any]:
    intents = state.get("intents", [])
    tools_to_run = plan_tools(intents, state)
    tool_results = {}
    
    for tool in tools_to_run:
        name = tool["name"]
        args = tool["args"]
        try:
            if name == "getWeather":
                res = await get_weather(args.get("location", state.get("destination") or "Uttarakhand"))
            elif name == "findStays":
                target_dest = args.get("destination") or state.get("destination") or "Uttarakhand"
                res = await find_stays(destination=target_dest, budget_tier=args.get("budget_tier", "Budget"))
            elif name == "calculateBudget":
                res = await calculate_budget(
                    duration_days=args.get("duration_days", state.get("duration_days") or 3), 
                    travelers=args.get("travelers", 2), 
                    budget_tier=args.get("budget_tier", "Budget"), 
                    destination=state.get("destination") or "Uttarakhand", 
                    user_budget=state.get("budget")
                )
            elif name == "getRoadAdvisory":
                res = await get_road_advisory(destination=state.get("destination") or "Uttarakhand")
            elif name == "exploreDestination":
                res = await explore_destination(destination=state.get("destination") or "Uttarakhand")
            else:
                res = {"success": False, "error": f"Tool {name} not found"}
            
            tool_results[name] = res
        except Exception as e:
            tool_results[name] = {"success": False, "error": str(e)}
            
    return {"tool_results": tool_results}

# --- 4. RAG RETRIEVAL NODE ---
async def rag_retrieval_node(state: Dict[str, Any]) -> Dict[str, Any]:
    msg = state.get("user_message", "")
    dest = state.get("destination")
    docs = retrieve_knowledge(msg, destination=dest, limit=2)
    return {"rag_documents": docs}

# --- 5. SYNTHESIS NODE (THE BRAIN + UI CONTROLLER) ---
async def synthesis_node(state: Dict[str, Any]) -> Dict[str, Any]:
    msg = state.get("user_message", "")
    
    # AGGRESSIVE CONTEXT LOCK
    dest = state.get("destination") or "Uttarakhand (User hasn't specified yet)"
    budget = state.get("budget")
    duration = state.get("duration_days")
    
    tool_results = state.get("tool_results", {})
    rag_docs = state.get("rag_documents", [])
    intents = state.get("intents", [])

    system_prompt = (
        f"YOU ARE CURRENTLY DISCUSSING: {dest}\n"
        f"USER BUDGET: {f'₹{budget:,}' if budget else 'Not specified'}\n"
        f"USER DURATION: {f'{duration} Days' if duration else 'Not specified'}\n\n"
        
        "You are 'Pahadi Copilot'. Speak in natural Hinglish. Be concise (under 100 words).\n\n"
        
        "=== AGENTIC RULES (VIOLATION = FAILURE) ===\n"
        "1. CHAIN OF THOUGHT: Before answering, think: 'User wants X. Do I have data? If no, call tool. If yes, answer.'\n"
        "2. TOOL FORCING: If user asks for 'price', 'stay', 'hotel', 'dharamshala', or 'cost', you MUST use the data in <TOOL> tags. DO NOT hallucinate.\n"
        f"3. UI ACTIONS: If user wants to book, rent, explore stays, or see a map, you MUST append a JSON action at the end:\n"
        f"   [ACTION: {{\"type\": \"REDIRECT\", \"target\": \"/rentals\", \"filters\": {{\"location\": \"{dest}\"}}}}] or\n"
        f"   [ACTION: {{\"type\": \"REDIRECT\", \"target\": \"/stays\", \"filters\": {{\"location\": \"{dest}\"}}}}] or\n"
        f"   [ACTION: {{\"type\": \"OPEN_MAP\", \"destination\": \"{dest}\"}}]\n"
        "4. CONTEXT LOCK: NEVER change destination unless user explicitly says 'I want to go to [New Place]'.\n"
        "5. NO GREETINGS: Never say 'Uttarakhand ka trip plan karna hai?' if we are already in a conversation.\n\n"
        
        "=== VERIFIED DATABASE DATA (USE THIS EXACT DATA) ===\n"
    )

    has_tool_data = False
    for tool_name, res in tool_results.items():
        if res.get("success") and res.get("data"):
            system_prompt += f"<TOOL name='{tool_name}'>{str(res.get('data'))[:1000]}</TOOL>\n"
            has_tool_data = True

    if not has_tool_data and ("STAY_SEARCH" in intents or "BUDGET" in intents):
        system_prompt += "<SYSTEM_NOTE>No specific stay data found in DB. Acknowledge this honestly.</SYSTEM_NOTE>\n"

    for doc in rag_docs:
        system_prompt += f"<KNOWLEDGE>{doc.get('content')}</KNOWLEDGE>\n"

    messages = list(state.get("history", []))
    messages.append({"role": "user", "content": msg})

    provider = await resolve_provider()
    res = None
    try:
        res = await provider.chat(system_prompt, messages)
    except Exception as err:
        print(f"[Graph] Provider failed: {err}")
        from ..llm.fallback import DeterministicFallbackProvider
        res = await DeterministicFallbackProvider().chat(system_prompt, messages)

    final_text = res.get("text", "") if res else "Maaf karna, network issue hai."
    
    # SAFEGUARD: If AI outputs the default greeting mid-chat, override it
    if "Uttarakhand ka trip plan karna hai?" in final_text and len(messages) > 1:
        final_text = f"Main {dest} ke plan par kaam kar raha hoon. Aapko stays, budget, ya activities me kya explore karna hai?"

    # EXTRACT UI ACTIONS FROM LLM TEXT
    ui_actions = []
    action_match = re.search(r'\[ACTION:\s*(\{[\s\S]*?\})\s*\]', final_text, re.IGNORECASE)
    if action_match:
        try:
            action_data = json.loads(action_match.group(1))
            ui_actions.append(action_data)
            # Clean the text response to remove the JSON block
            final_text = final_text.replace(action_match.group(0), "").strip()
        except json.JSONDecodeError:
            pass

    # FALLBACK INTENT-BASED UI ACTIONS (If LLM forgot to output [ACTION: ...])
    if not ui_actions:
        clean_dest = state.get("destination") or "Uttarakhand"
        if "RENTAL_SEARCH" in intents:
            ui_actions.append({"type": "OPEN_RENTALS", "target": "/rentals", "filters": {"location": clean_dest}})
        elif "STAY_SEARCH" in intents:
            ui_actions.append({"type": "OPEN_STAYS", "target": "/stays", "filters": {"location": clean_dest}})
        elif "MAP" in intents or "ROUTE" in intents:
            ui_actions.append({"type": "OPEN_MAP", "destination": clean_dest})

    return {
        "final_response": final_text,
        "provider_used": provider.name if provider else "fallback",
        "confidence": "grounded",
        "ui_actions": ui_actions
    }

# === BUILD WORKFLOW ===
workflow = StateGraph(AgentState)
workflow.add_node("understand", understand_node)
workflow.add_node("slot_analysis", slot_analysis_node)
workflow.add_node("tool_execution", tool_execution_node)
workflow.add_node("rag_retrieval", rag_retrieval_node)
workflow.add_node("synthesis", synthesis_node)

workflow.set_entry_point("understand")
workflow.add_edge("understand", "slot_analysis")
workflow.add_edge("slot_analysis", "tool_execution")
workflow.add_edge("tool_execution", "rag_retrieval")
workflow.add_edge("rag_retrieval", "synthesis")
workflow.add_edge("synthesis", END)

AGENT_GRAPH = workflow.compile(checkpointer=CHECKPOINTER)