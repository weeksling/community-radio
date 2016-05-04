# Community.dj
A live music lobby that rotates between peoples song suggestions, anyone can listen anonymously but internally people can register, listen, create playlists and click ‘start djing’ to queue up their songs.

This app is using node, mongodb (mongoose), react, browserify, babel, sass and gulp, the project will auto build sass and javascript when changes are made and the server will auto reload when node src is changed.

## Running the app:
	
	//Ensure node is up to date for harmony support
	sudo npm cache clean -f
	sudo npm install -g n
	sudo n stable

	//Ensure mongodb is installed and mongodb is running
	sudo mongod

	//Install dependencies
	npm install

	// Start gulp
	gulp

visit http://localhost:3000

## To Do List (intenral)
1. Setup lobby design
	1a. Implement pagination for lobbies
	1b. Implement sticky lobby's so community.dj lobby's stay on top
	1c. Improve your lobby section
	1d. Setup edit lobby and move create lobby into it's own page
	1e. Setup filters on the side
	1f. Setup listening feed for each lobby
2. Setup sidebar menu
3. Implement playlists as an individual page and redesign it - make header area a partial block so next to menu you can include search, links etc specific to that view