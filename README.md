# Edgeusher-GUI

This project is a web application that implement a GUI for EdgeUsher (https://github.com/di-unipi-socc/EdgeUsher).

## Execution

To run this program you need to install docker-compose (https://docs.docker.com/compose/) first.
On Ubuntu it can be done with the command `sudo apt install docker-compose`.

At this point simply run the command `sudo docker-compose up` to start the application on localhost with the front-end is listening on port 8080 and the back-end is listening on port 5000.

If you want to change the default ports go to docker-compose.yml file and change the number of the ports there, if you want to start the back-end on another IP address go to conf.env file and change SERVER_NAME and SERVER_PORT environment variables.
If you change the port number of backend in the docker-compose.yml file, you need to change the SERVER_PORT in conf.env too.
