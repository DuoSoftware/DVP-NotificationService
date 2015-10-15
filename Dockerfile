FROM ubuntu
RUN apt-get update
RUN apt-get install -y git nodejs npm
RUN git clone git://github.com/DuoSoftware/DVP-NotificationService.git /usr/local/src/notificationservice
RUN cd /usr/local/src/notificationservice; npm install
CMD ["nodejs", "/usr/local/src/notificationservice/app.js"]

EXPOSE 8833
