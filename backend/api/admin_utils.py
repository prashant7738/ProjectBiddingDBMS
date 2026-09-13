from django.conf import settings


def is_admin_user(user_id, email):
    admin_emails = getattr(settings, 'ADMIN_EMAILS', [])
    admin_user_ids = getattr(settings, 'ADMIN_USER_IDS', [])

    # Fail closed: nobody is an admin until ADMIN_EMAILS or ADMIN_USER_IDS is
    # configured. A "user_id == 1 by default" fallback here would silently
    # grant admin access to the very first signup on any deployment that
    # forgets to set these env vars. Set ADMIN_EMAILS or ADMIN_USER_IDS
    # (see backend/.envexample) to grant access.
    if not admin_emails and not admin_user_ids:
        return False

    admin_emails_lower = {e.lower() for e in admin_emails if e}
    admin_user_ids_set = set(admin_user_ids)

    if email and email.lower() in admin_emails_lower:
        return True

    if user_id in admin_user_ids_set:
        return True

    return False
