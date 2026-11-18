
import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()


def send_email(to_email, subject, body):
    sender = os.getenv("EMAIL_ADDRESS")
    password = os.getenv("EMAIL_APP_PASSWORD")

    if not sender or not password:
        raise RuntimeError("Email credentials are missing.")

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = sender
    message["To"] = to_email
    message.set_content(body)

    with smtplib.SMTP("smtp.gmail.com", 587, timeout=20) as server:
        server.starttls()
        server.login(sender, password.replace(" ", ""))
        server.send_message(message)


def send_enquiry_response(to_email, citizen_name, subject, response):
    body = f"""Dear {citizen_name},

Thank you for contacting the CM Kerala Grievance Redressal Portal.

Subject: {subject}

Admin Response:
{response}

Regards,
CM Kerala Grievance Redressal Portal

Demonstration prototype. Not an official Government of Kerala website.
"""
    send_email(
        to_email,
        f"Response to your enquiry: {subject}",
        body
    )


def send_enquiry_otp(to_email, otp):
    body = f"""Your email verification OTP is: {otp}

This OTP is valid for 5 minutes.

If you did not request this OTP, please ignore this email.
"""
    send_email(
        to_email,
        "Email Verification OTP - CM Kerala Grievance Portal",
        body
    )
