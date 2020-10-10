# Edgeusher-GUI

This project is a web application that implement a GUI for EdgeUsher (https://github.com/di-unipi-socc/EdgeUsher).

## Execution

Due to the fact that Windows platform is not supported by the PySDD library (https://github.com/wannesm/PySDD), this project does not work correctly on Windows. 
To run this program you need to install docker and docker-compose (https://docs.docker.com/compose/) first.
To install docker follow this guide https://docs.docker.com/engine/install/.
On Ubuntu docker-compose can be installed with the command `sudo apt install docker-compose`.

At this point simply run the command `sudo docker-compose up` to start the application on localhost with the front-end is listening on port 8080 and the back-end is listening on port 5000.

If you want to change the default ports go to docker-compose.yml file and change the number of the ports there.
If you want to start the back-end on another IP address go to /EdgeUsher-frontend/src/assets/config.json and change the value of "apiUrl" with the IP address of the back-end, then change also the value of "SERVER_NAME" in "conf.env" file with this value.
If you change the port number of backend in the docker-compose.yml file, you need to change the SERVER_PORT in conf.env too.
