"""WhatsApp & Payment Reminders Router
Provides multi-lingual WhatsApp reminder templates (English, Hindi, Telugu)
and logs reminders sent to counterparties.
"""
import urllib.parse
from datetime import date, timedelta
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Invoice, Counterparty

router = APIRouter(prefix="/api/reminders", tags=["reminders"])


class ReminderItem(BaseModel):
    id: str
    invoice_id: int
    invoice_number: str
    party_id: int
    party_name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    amount: float
    amount_formatted: str
    due_date: str
    days_left: int
    status: str  # overdue, due_soon, upcoming
    status_label: str
    messages: Dict[str, str]  # en, hi, te
    whatsapp_url: str
    last_sent_at: Optional[str] = None


class SendReminderRequest(BaseModel):
    invoice_id: int
    channel: str = "whatsapp"  # whatsapp or email
    language: str = "en"
    custom_message: Optional[str] = None


def _format_inr(amount: float) -> str:
    s = f"{abs(amount):,.0f}"
    parts = s.split(",")
    if len(parts) <= 1:
        return f"₹{s}"
    last = parts[-1]
    rest = parts[:-1]
    flat = "".join(rest) + last
    if len(flat) <= 5:
        formatted = flat[:-3] + "," + flat[-3:]
    elif len(flat) <= 7:
        formatted = flat[:-5] + "," + flat[-5:-3] + "," + flat[-3:]
    else:
        formatted = flat[:-7] + "," + flat[-7:-5] + "," + flat[-5:-3] + "," + flat[-3:]
    return f"₹{formatted}"


def _generate_templates(customer_name: str, contact_person: str, inv_number: str, amount: float, due_date: date, days_left: int) -> Dict[str, str]:
    amt_str = _format_inr(amount)
    due_str = due_date.strftime("%d %b %Y")
    contact = contact_person.split()[0] if contact_person else "Sir/Madam"

    if days_left < 0:
        # Overdue
        days_overdue = abs(days_left)
        en = (
            f"Dear {contact}, greetings from Deccan Precision Components, Hyderabad. "
            f"This is a gentle reminder regarding invoice {inv_number} for {amt_str}, "
            f"which was due on {due_str} ({days_overdue} days ago). "
            f"Kindly let us know when we can expect the NEFT/RTGS transfer. "
            f"Thank you for your continued partnership. — Rakesh Reddy"
        )
        hi = (
            f"नमस्ते {contact} जी, डेक्कन प्रेसिजन कॉम्पोनेंट्स हैदराबाद की ओर से सादर प्रणाम। "
            f"यह इनवॉइस {inv_number} राशि {amt_str} के संदर्भ में एक विनम्र अनुस्मारक है, "
            f"जो {due_str} ({days_overdue} दिन पहले) देय थी। "
            f"कृपया हमें बताएं कि भुगतान कब तक प्राप्त हो सकता है। "
            f"आपके सहयोग के लिए धन्यवाद। — राकेश रेड्डी"
        )
        te = (
            f"నమస్కారం {contact} గారు, డెక్కన్ ప్రిసిషన్ కాంపోనెంట్స్ హైదరాబాద్ నుండి. "
            f"ఇన్వాయిస్ {inv_number} మొత్తం {amt_str} చెల్లింపు గడువు {due_str} నాటితో ({days_overdue} రోజుల క్రితం) ముగిసింది. "
            f"దయచేసి ఈ బకాయి ఎప్పుడు చెల్లిస్తారో తెలియజేయగలరు. "
            f"మీ సహకారానికి ధన్యవాదాలు. — రాకేష్ రెడ్డి"
        )
    elif days_left <= 7:
        # Due in next 7 days
        en = (
            f"Dear {contact}, greetings from Deccan Precision Components. "
            f"A quick reminder that invoice {inv_number} for {amt_str} will be due in {days_left} days on {due_str}. "
            f"Appreciate if you could process this in your upcoming payment cycle. "
            f"Best regards, Rakesh Reddy."
        )
        hi = (
            f"नमस्ते {contact} जी, डेक्कन प्रेसिजन कॉम्पोनेंट्स की ओर से नमस्कार। "
            f"याद दिलाना चाहते हैं कि इनवॉइस {inv_number} राशि {amt_str} का भुगतान {days_left} दिनों में ({due_str}) देय है। "
            f"कृपया इसे अपने अगले भुगतान चक्र में शामिल करें। धन्यवाद, राकेश रेड्डी।"
        )
        te = (
            f"నమస్కారం {contact} గారు, డెక్కన్ ప్రిసిషన్ కాంపోనెంట్స్ నుండి. "
            f"ఇన్వాయిస్ {inv_number} మొత్తం {amt_str} చెల్లింపు గడువు మరో {days_left} రోజుల్లో ({due_str}) ఉంది. "
            f"దయచేసి తదుపరి చెల్లింపులలో ప్రాసెస్ చేయగలరు. ధన్యవాదాలు, రాకేష్ రెడ్డి."
        )
    else:
        # Upcoming
        en = (
            f"Dear {contact}, hope you are doing well. "
            f"Invoice {inv_number} for {amt_str} is scheduled for payment on {due_str}. "
            f"Thank you, Deccan Precision Components."
        )
        hi = (
            f"नमस्ते {contact} जी, इनवॉइस {inv_number} राशि {amt_str} का भुगतान {due_str} को निर्धारित है। डेक्कन प्रेसिजन कॉम्पोनेंट्स।"
        )
        te = (
            f"నమస్కారం {contact} గారు, ఇన్వాయిస్ {inv_number} మొత్తం {amt_str} చెల్లింపు తేదీ {due_str}. డెక్కన్ ప్రిసిషన్ కాంపోనెంట్స్."
        )

    return {"en": en, "hi": hi, "te": te}


@router.get("", response_model=List[ReminderItem])
def list_reminders(db: Session = Depends(get_db)):
    today = date.today()
    horizon = today + timedelta(days=14)

    # Open customer receivables
    invoices = (
        db.query(Invoice)
        .filter(
            Invoice.invoice_type == "receivable",
            Invoice.paid_date == None,
            Invoice.status.in_(["unpaid", "overdue"]),
            Invoice.due_date <= horizon,
        )
        .order_by(Invoice.due_date)
        .all()
    )

    reminders: List[ReminderItem] = []
    for inv in invoices:
        cp = db.query(Counterparty).get(inv.counterparty_id)
        if not cp:
            continue

        days_left = (inv.due_date - today).days
        if days_left < 0:
            status = "overdue"
            status_label = f"{abs(days_left)} days overdue"
        elif days_left <= 7:
            status = "due_soon"
            status_label = f"Due in {days_left} days"
        else:
            status = "upcoming"
            status_label = f"Due in {days_left} days"

        templates = _generate_templates(
            customer_name=cp.name,
            contact_person=cp.contact_person or "Customer",
            inv_number=inv.invoice_number,
            amount=inv.amount,
            due_date=inv.due_date,
            days_left=days_left,
        )

        phone_clean = "".join(filter(str.isdigit, cp.phone or "9849123456"))
        if not phone_clean.startswith("91") and len(phone_clean) == 10:
            phone_clean = f"91{phone_clean}"

        encoded_text = urllib.parse.quote(templates["en"])
        whatsapp_url = f"https://wa.me/{phone_clean}?text={encoded_text}"

        reminders.append(
            ReminderItem(
                id=f"rem-{inv.id}",
                invoice_id=inv.id,
                invoice_number=inv.invoice_number,
                party_id=cp.id,
                party_name=cp.name,
                contact_person=cp.contact_person,
                phone=cp.phone,
                email=cp.email,
                amount=inv.amount,
                amount_formatted=_format_inr(inv.amount),
                due_date=inv.due_date.isoformat(),
                days_left=days_left,
                status=status,
                status_label=status_label,
                messages=templates,
                whatsapp_url=whatsapp_url,
                last_sent_at=None,
            )
        )

    return reminders


@router.post("/send")
def log_reminder_sent(payload: SendReminderRequest, db: Session = Depends(get_db)):
    inv = db.query(Invoice).get(payload.invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # In a full app, we would log this into a reminder_logs table
    # For now, append to notes
    stamp = datetime.now().strftime("%d %b %H:%M")
    inv.notes = f"{inv.notes or ''} | Reminder sent via {payload.channel} ({payload.language}) on {stamp}"
    db.commit()

    return {
        "ok": True,
        "message": f"Reminder for {inv.invoice_number} recorded as sent via {payload.channel}.",
        "timestamp": stamp,
    }

