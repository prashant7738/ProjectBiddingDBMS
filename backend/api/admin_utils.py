from django.conf import settings


def is_admin_user(user_id, email):
    admin_emails = {e.lower() for e in getattr(settings, 'ADMIN_EMAILS', []) if e}
    admin_user_ids = set(getattr(settings, 'ADMIN_USER_IDS', []))

    if email and email.lower() in admin_emails:
        return True

    if user_id in admin_user_ids:
        return True

    return False
