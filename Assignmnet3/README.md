## How to deploy to Google Cloud Platform
1. In the `/client/angular.json` file, increase the budget to:
    ```
        "budgets": [
    {
        "type": "initial",
        "maximumWarning": "2mb",
        "maximumError": "5mb"
    },
    ...
    ```
2. Remove `localhost:8080` from the backend call url in file `/client/backend.service.ts`:
    ```
    @Injectable({
    providedIn: 'root'
    })
    @Injectable()
    export class BackendService {
        // readonly url = 'http://localhost:8080' 
        readonly url = ''
        readonly autocomplete = this.url +'/auto/'
        readonly profile = this.url +'/profile/'
        readonly hourly = this.url +'/hourly/'
        readonly history = this.url +'/history/'
        ...
    ```
3. Run `ng build` in the `/client` directory. This will produce a `/dist` folder.
4. Copy the `dist` folder and paste it in the `/server` folder
5. In the `/server/server.js` file, insert the code before the API functions:
    ```
    // Serve static files from the dist directory
    // Set MIME type for JavaScript files
    app.use(express.static(path.join(__dirname, './dist/angular-bootstrap-examples/browser'), {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.js')) {
        res.set('Content-Type', 'application/javascript');
        }
    }
    }));
    ```
    Make sure to change the directory file path according to the built client app
6. In the same file, insert the code aftter the API functions:
    ```
    // Route to serve index.html for any other request
    app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './dist/angular-bootstrap-examples/browser/index.html'));
    });
    ```
    Again, make sure the directory file path leads to the `index.html` file in the built client app
7. Run `gcloud app deploy` in the `/server` folder, where `server.js` is in
