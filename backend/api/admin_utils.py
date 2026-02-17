from django.conf import settings


def is_admin_user(user_id, email):
    admin_emails = getattr(settings, 'ADMIN_EMAILS', [])
    admin_user_ids = getattr(settings, 'ADMIN_USER_IDS', [])
    
    # If both lists are empty, treat user_id=1 as admin by default (common convention)
    if not admin_emails and not admin_user_ids:
        return user_id == 1
    
    admin_emails_lower = {e.lower() for e in admin_emails if e}
    admin_user_ids_set = set(admin_user_ids)

    if email and email.lower() in admin_emails_lower:
        return True

    if user_id in admin_user_ids_set:
        return True

    return False
