FROM python:3.9.0b3-buster

WORKDIR /app
ENV FLASK_APP main.py
ENV FLASK_RUN_HOST 0.0.0.0

ADD . /app

RUN pip3 install -r requirements.txt
RUN pip3 install -vvv --upgrade --force-reinstall --no-binary :all: --no-deps pysdd

CMD [ "flask", "run" ]
