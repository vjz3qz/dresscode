OLD

uvicorn app:app
python celery_worker.py
npm run dev
celery -A celery_worker beat --loglevel=info
redis-server

NEW
in server dir:
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
celery -A core.celery_worker worker --loglevel=info --pool=threads

<!-- celery -A core.celery_worker beat --loglevel=info -->

in client dir:
npx expo start

in ec2 server:
cd dresscode
source export_env.sh
cd server
source venv/bin/activate
tmux new -s server
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
^ + b, c
celery -A core.celery_worker worker --loglevel=info --pool=threads
^ + b, d
sudo systemctl restart nginx
