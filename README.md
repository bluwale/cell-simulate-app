This project simulates the bacterial growth inside a petri dish, where the user has controls over the time interval, the probability of mutation, and cell lifespan variables. Users can also add and remove live cells from the petri dish. The project also maps the current live, dead and total cells in the petri dish each generation in the file. The project runs as a regular typescript react app does, with the app.tsx file deploying everything, and many of the functionalities of the app being compartmentalized into separate initialization files inside the components directory. Key components include the initialization of the petri dish inside PetriDish.tsx, the ControlPanel and legend files try and reduce the load of app.tsx, and the GrowthChart.tsx file contains the initialization of the bonus component of the growth chart. The only assumption made in the project was the fact that users who wanted to manually add or remove cells would want to only add live cells. I also decided to display performance metrics directly on to the web app instead of the README (i got kind of interested in how it works and wanted to display it better).

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## How To Use
Adjust time interval, mutation rate and cell lifespan variables to desire, then click start simulation. Watch simulation grow over the mutliple generations. To stop simulation, click stop simulation and select reset grid if you want to. User can click on individual cells on the petri dish as well to add or remove living cells. Performance Metrics and Growth Chart graphs can be viewed with buttons. 




## Tech Stack
- React + Typescript
- CSS Modules
- GitHub Pages (deployment)


## Available Scripts

In the project directory, you can run:
### `npm Install`

Run this first, it will install the correct packages and dependencies for the app to function

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Component Summaries

Component 1: InputField.tsx)
InputField.tsx is a simple inputfield file, that initializes inputfield logic as simple as possible for more effective modularity. 

component 2: ControlPanel.tsx)
ControlPanel.tsx file initializes the inputs for changing the time interval, the mutation rate, lifespan, start/stop button and reset button. Imports InputField.tsx, and uses button features. Is placed in a seperate file for better readability and less clutter. 

component 3: InitializeSimulation.tsx)
InitializeSimulation.tsx file does multiple things, it first creates a basic 2d grid, and randomly generates even or odd cells inside. It also initializes the function getNeighbors, which uses arrray of coordinates as directions, and function simulateGeneration, which adds, aging and mutation funtionality. There is heavy commenting in this file as the functionality added is more complex than others. 

component 4: Legend.tsx)
Legend.tsx file creates a simple graphic for user to understand the colors that represent dead, alive and mutated cells. Is initialized in a seperate file for better modularity and readability of app.tsx

component 5: PetriDish.tsx)
PetriDish.tsx is a simple visualizer for our 2D grid, using css styling to create nice looking cell blocks for the grid. Uses virtualization to keep massive grid working as smoothly as possible. 

component 6: StatisticsPanel.tsx)
StatisticsPanel.tsx file creates simple counting graphics for the simulation, for user to keep track of live, dead and mutated cells. Is initialized in a seperate file for better modularity and readability of app.tsx 

component 7: styles.css)
styles.css holds almost all of the styling for the different components of the app. 


## App.tsx 
The main logic is deployed in this file, with so many components being deployed and use cases being initialized it is a bit long. A quick summary of what happens in the file is: new interval is set for every new simulation, performance statistics functionality have been added and exported onto a csv, which is then styled seperately. GrowthChart, ControlPanel, Legend and all other componenents have been imported and deployed properly to manage clean and easy to read UI.  

