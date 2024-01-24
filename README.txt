How to use the tool.

1. Navigate to loganalyzer where the react code is located.
2. Run the command "npm start".
3. Navigate to "https://ipgeolocation.io/". Create a free account and generate your own API key. (There are free api keys with limited requests / month)
4. Navigate back to the root of the project.
5. Add a .env file.
6. Add a variable: API_TOKEN = "YOUR_API_TOKEN".
7. Add a variable: API_URL = https://api.ipgeolocation.io/ipgeo (this is the API I use to retrieve informations about the IPs from the logs).
8. Type "python app.py" to start the flask application / api
9. Go back to your frontend which should be accessible on localhost:YOUR_PORT
10. Load your nginx logs as a .txt file.
11. Enjoy !