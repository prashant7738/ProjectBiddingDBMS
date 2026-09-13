# Local dev entry point: chdirs into backend/ first so it works regardless
# of the caller's cwd (module resolution + .env discovery both depend on it),
# then runs the same daphne ASGI server the Procfile uses in production.
import os
import sys

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(BACKEND_DIR)
sys.path.insert(0, BACKEND_DIR)

if __name__ == "__main__":
    from daphne.cli import CommandLineInterface
    sys.argv = ["daphne", "-b", "127.0.0.1", "-p", "8000", "project_main.asgi:application"]
    CommandLineInterface.entrypoint()
