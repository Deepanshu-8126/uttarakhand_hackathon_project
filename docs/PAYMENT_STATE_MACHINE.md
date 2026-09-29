# Discovery Uttarakhand — Payment & Booking State Machine
**Document ID:** `SPEC-M02-STATE-MACHINE`  
**Date:** September 2026  
**Status:** Canonical Implementation Guide  

---

## 1. Payment Lifecycle State Machine

```
              ┌────────────────────────┐
              │        CREATED         │ (Razorpay Order generated)
              └───────────┬────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
  ┌───────────────────┐       ┌───────────────────┐
  │      PENDING      │       │      FAILED       │ (Customer cancelled or
  │  (UPI / QR wait)  │       │                   │  gateway declined)
  └─────────┬─────────┘       └───────────────────┘
            │
            ├───────────────────────────┐
            ▼                           ▼
  ┌───────────────────┐       ┌───────────────────┐
  │    AUTHORIZED     │       │     CANCELLED     │
  └─────────┬─────────┘       └───────────────────┘
            │
            ▼
  ┌───────────────────┐
  │     CAPTURED      │ (HMAC signature verified or webhook payment.captured)
  └─────────┬─────────┘
            │
      ┌─────┴─────────────────┐
      ▼                       ▼
┌───────────────────┐   ┌───────────────────┐
│ PARTIALLY_REFUNDED│   │     REFUNDED      │ (Full refund confirmed by gateway)
└───────────────────┘   └───────────────────┘
```

### Transition Table:
| Current State | Allowed Next States | Trigger Event |
|---|---|---|
| `CREATED` | `PENDING`, `AUTHORIZED`, `CAPTURED`, `FAILED`, `CANCELLED` | Order created at Razorpay. |
| `PENDING` | `AUTHORIZED`, `CAPTURED`, `FAILED`, `CANCELLED` | Customer interaction at gateway. |
| `AUTHORIZED` | `CAPTURED`, `FAILED` | Manual or auto-capture initiated. |
| `CAPTURED` | `PARTIALLY_REFUNDED`, `REFUNDED` | Verified signature or gateway webhook. |
| `FAILED` | *(Terminal)* | Customer can start a new payment attempt. |
| `CANCELLED` | *(Terminal)* | User closed modal or expired. |
| `REFUNDED` | *(Terminal)* | Full amount reversed to customer bank/UPI. |

---

## 2. Booking Lifecycle State Machine

```
              ┌────────────────────────┐
              │    PENDING_PAYMENT     │ (Booking created; price frozen)
              └───────────┬────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
  ┌───────────────────┐       ┌───────────────────┐
  │ PAYMENT_PROCESSING│       │     CANCELLED     │ (Timeout / abandon)
  └─────────┬─────────┘       └───────────────────┘
            │
            ▼ (Payment status === 'CAPTURED')
  ┌───────────────────┐
  │     CONFIRMED     │ (Escrow active; check-in OTP generated)
  └─────────┬─────────┘
            │
      ┌─────┴─────────────────┐
      ▼                       ▼
┌───────────────────┐   ┌───────────────────┐
│    CHECKED_IN     │   │ REFUND_PROCESSING │ (Cancellation requested)
│ (Physical OTP ok) │   └─────────┬─────────┘
└─────────┬─────────┘             │
          │                       ▼
          ▼             ┌───────────────────┐
┌───────────────────┐   │     REFUNDED      │
│     COMPLETED     │   └───────────────────┘
│ (Escrow released) │
└───────────────────┘
```
