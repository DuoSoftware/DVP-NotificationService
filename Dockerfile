FROM ubuntu
RUN apt-get update
RUN apt-get install -y git nodejs npm
RUN git clone git://github.com/DuoSoftware/DVP-NotificationService.git /usr/local/src/notificationService
RUN cd /usr/local/src/notificationService; npm install
CMD ["nodejs", "/usr/local/src/notificationService/app.js"]

EXPOSE 8833