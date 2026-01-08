"""Webhook endpoints for external services."""

from fastapi import APIRouter, Request, HTTPException, status

router = APIRouter()


@router.post("/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    # TODO: Implement Stripe webhook handling
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Stripe webhooks not yet implemented"
    )

