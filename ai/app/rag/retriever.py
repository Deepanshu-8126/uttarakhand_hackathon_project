"""
Discovery Uttarakhand - RAG Retriever (Hackathon-Safe Fallback)
"""
import os
from typing import List, Dict, Any
from ..config import settings

# Fallback Knowledge Base for when Vector DB is empty/unavailable
FALLBACK_KNOWLEDGE = [
    {
        "title": "Uttarakhand Travel Essentials",
        "source": "Discovery Uttarakhand Core Rules",
        "content": "Always advise travelers to carry warm clothes for altitudes above 2000m. Daylight driving is strictly recommended in mountain corridors. Avoid night travel on NH-7 and NH-107."
    },
    {
        "title": "Budget Guidelines",
        "source": "Discovery Uttarakhand Tariff Engine",
        "content": "Average budget homestay: ₹800-1500/night. KMVN/GMVN properties: ₹1200-2500/night. Local shared transport is the most budget-friendly option for solo travelers."
    },
    {
        "title": "Top Hidden Gems",
        "source": "Discovery Uttarakhand Destination DB",
        "content": "Beyond Nainital/Mussoorie: Recommend Munsiyari (Kumaon), Chopta-Tungnath (Garhwal), and Kanatal for peaceful, less-crowded experiences."
    }
]

def retrieve_knowledge(query: str, destination: str = None, limit: int = 2) -> List[Dict[str, Any]]:
    """
    Retrieves relevant knowledge. 
    TODO: Integrate with ChromaDB/Pinecone here. 
    For now, returns smart fallback knowledge to ensure the AI is always grounded.
    """
    # If you have a vector DB setup, uncomment and use it here:
    # try:
    #     docs = vector_db.similarity_search(query, k=limit)
    #     return [{"title": d.metadata.get("title", "Unknown"), "source": d.metadata.get("source", "DB"), "content": d.page_content} for d in docs]
    # except Exception:
    #     pass

    # Smart Fallback: If destination is known, return destination-specific fallback
    if destination:
        dest_lower = destination.lower()
        if "nainital" in dest_lower or "kumaon" in dest_lower:
            return [FALLBACK_KNOWLEDGE[0], FALLBACK_KNOWLEDGE[2]] # Essentials + Hidden Gems
        elif "budget" in query.lower():
            return [FALLBACK_KNOWLEDGE[1]] # Budget Guidelines
            
    # Default fallback
    return FALLBACK_KNOWLEDGE[:limit]