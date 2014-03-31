AI Tree for Kiwi
Readme
Benjamin D. Richards
2013.12.20


CONTENTS

INTRODUCTION
LOADING AITree
CREATING AN AI
INNER NODES
OUTER NODES: LIBRARIES, ACTIONS AND CONDITIONS
EXAMPLE LIBRARY
FUTURE POSSIBILITIES
ACKNOWLEDGEMENTS



INTRODUCTION

Welcome to the AI Tree for Kiwi plugin.

With this code, you can build a behaviour tree to control game behaviours. This is a powerful and easy-to-understand artificial intelligence system.



LOADING AITree

In your HTML file, simply load the AITreePlugin file after Kiwi.js:

	<script src="js/kiwi.js"></script>
	<script src="js/plugins/AITreePlugin/AITreePlugin.js"></script>

This will automatically register itself with Kiwi and become accessible.



CREATING AN AI

The core of the AI is an "AI" object. This manages the behaviour tree after you have set it up.

First, create the AI object:

	var ai = new Kiwi.Plugins.AITree.AI();

Then, attach it to a game object:

	myExampleSprite.ai = ai;

Finally, ensure that the AI is updated as part of your program, for example:

	// Call the AI from the main update function
	MyAITest.update = function()
	{
		Kiwi.State.prototype.update.call( this );
		myExampleSprite.ai.update();
	}

or:

	// Call the AI automatically upon creation
	myExampleSprite.update = function()
	{
		Kiwi.GameObjects.Sprite.prototype.update.call( this );
		this.ai.update();
	}

That's all you need to get the AI running. Of course, it won't do anything yet, so you're going to need some nodes.

A behaviour tree is a directed acyclic graph. This means it's a hierarchy of nodes, and you can't create loops. When you call "update" on the AI object, the tree calls the first node, which performs some calculations and then calls some or none of its children. When a node is done, it returns a signal up the tree, which eventually returns to the AI object. This can create very complex decision-making processes in a very logical manner, somewhat like a flowchart.

There are two kinds of node: inner and outer.

An inner node controls the flow. These are useful for making decisions based on inputs or running lots of actions. They can (and should) have child nodes.

An outer node does something. This is conceptually divided into two types: Conditions, which check something in the world; and Actions, which perform some action. There isn't any structural difference between them, and it's possible to make hybrid outer nodes that take inputs and then perform actions, but for clarity you should consider keeping their functions separate. Outer nodes cannot have children.

All nodes return a status. This is one of the following:
- READY
- RUNNING
- SUCCESS
- FAILURE
- ERROR

The status of the child informs the parent how to continue.



INNER NODES

The inner node library is the core of the AI Tree. There are five kinds of inner node:
- Selector
- Sequencer
- UntilFailure
- UntilSuccess
- UntilTime

All inner nodes are created with an object parameter called "params". This can be empty, and can contain the following data:

	var params = {
		name: "Beautiful description of the node",
		shuffle: false
	}

The "name" parameter is useful for analysing complex trees.
The "shuffle" parameter will tell the node to randomly shuffle its children. This is FALSE by default.

All inner nodes share the following functions:

	node.addChild( childNode );
	node.removeChild( childNode );

where "childNode" is another node object. Use "addChild" to build your behaviour tree. Use "removeChild" for on-the-fly alterations. Be careful when changing the tree at runtime; it may react unpredictably. It's best to use a static tree.

All inner nodes share the following property:

	node.runsParents = false;

This property defaults to FALSE. If set to TRUE, a signal from this node stating that it is RUNNING will also set its parent to RUNNING, not SUCCESS. This behaviour is disabled by default because it will monopolise the tree. Enable it if you want this node to finish running, even if its siblings would normally have priority.


SELECTOR NODE

	var selector = new Kiwi.Plugins.AITree.Selector( params );

The Selector node steps through its children. It returns SUCCESS if a child succeeds. It returns FAILURE if no child succeeds. It returns RUNNING if a child returns RUNNING, and resumes from that child on the next update.

Use the Selector node to find a suitable action from an ordered list. Append Condition nodes to return without selecting an action: for example, to avert an action if a condition is true.


SEQUENCER NODE

	var sequencer = new Kiwi.Plugins.AITree.Sequencer( params );

The Sequencer node steps through its children. It returns SUCCESS if all children succeed. It returns FAILURE if a child fails. It returns RUNNING if a child returns RUNNING, and resumes from that child on the next update.

Use the Sequencer node to follow a sequence or to check several conditions before performing an action.


UNTIL FAILURE

	var untilFailure = new Kiwi.Plugins.AITree.UntilFailure( params );

The UntilFailure node steps through its children, over and over. It returns SUCCESS if a child fails. It returns RUNNING if a child returns RUNNING, and resumes from that child on the next update. It does not have a failure state.

Use the UntilFailure node to iterate over a task until it is complete.

Be careful with this node. If you are not careful, you may enter an infinite loop and freeze your game.


UNTIL SUCCESS

	var untilSuccess = new Kiwi.Plugins.AITree.UntilSuccess( params );

The UntilSuccess node steps through its children, over and over. It returns SUCCESS if a child succeeds. It returns RUNNING if a child returns RUNNING, and resumes from that child on the next update. It does not have a failure state.

Use the UntilSuccess node to iterate over a task until it is complete.

Be careful with this node. If you are not careful, you may enter an infinite loop and freeze your game.


UNTIL TIME

	var params = { timerDuration: 100 };
	Kiwi.Plugins.AITree.UntilTime( params );

The UntilTime node steps through its children, over and over, for a number of milliseconds defined by the timerDuration param. The default is 100. It returns SUCCESS at that time. It returns RUNNING if a child returns RUNNING, and resumes from that child on the next update. It does not have a failure state.

Use the UntilTimer node to iterate over a task without a defined end state. Because it times out, you do not need to worry about infinite loops freezing the game.



OUTER NODES: LIBRARIES, ACTIONS AND CONDITIONS

There are no default outer nodes. These have to interface with your game objects and might be required to assess any kind of data or perform any kind of action. You must write or acquire your own library.

An outer node library is a simple Kiwi.js plugin containing the declaration of your desired outer nodes. Load your plugin after the core AITree.js file:

	<script src="js/kiwi.js"></script>
	<script src="js/plugins/AITreePlugin/AITreePlugin.js"></script>
	<script src="js/plugins/AITreePlugin/MyNodeLibrary.js"></script>

Inside your library plugin, you should create divisions to distinguish between Actions and Conditions. There is no functional difference to the AI tree, but they serve different functions. You may wish to create further subdivisions if you have many different nodes.

	Kiwi.Plugins.MyNodeLibrary = 
	{
		name:"MyNodeLibrary",
		version:"1.0"
	}
	Kiwi.PluginManager.register( Kiwi.Plugins.MyNodeLibrary );
	
	Kiwi.Plugins.MyNodeLibrary.Actions = {};
	Kiwi.Plugins.MyNodeLibrary.Conditions = {};

Your outer node uses the core library template "AITreeOuterNode" as its base. You may wish to extract additional data from params at this stage, such as a target object or threshold value.

	Kiwi.Plugins.MyNodeLibrary.Actions.MyAction = function( params )
	{
		Kiwi.Plugins.AITree.AITreeOuterNode.call( this, params );
	}

The code executed by your outer node goes in a "run" method:

	Kiwi.Plugins.MyNodeLibrary.Actions.MyAction.run = function()
	{
		// Your code goes here
	}

The "run" function does not expect a return type. However, you should be certain to set the "status" property of the node during your run. This tells the rest of the tree how to behave.

	this.status = this.STATUS_SUCCESS;

There are five status values in the default node template. Call them by name and do not override their values or the program may react unpredictably.
	STATUS_READY
	STATUS_RUNNING
	STATUS_SUCCESS
	STATUS_FAILURE
	STATUS_ERROR

That's it! A fully functional node is yours. Attach it to an inner node and you're away laughing.

Be mindful when designing outer nodes. It is usually best to manipulate as little data as possible. If you are designing an action that moves a character, it is good practice to give the character a move method, and call that from the action node rather than move the character directly.



EXAMPLE LIBRARY

The example library "LibrarySpaceChase.js" includes three sample outer nodes. It is a very simple example of how you might create your own library of action and conditonal nodes.

ACTIONS:
- MoveToDestination - a monster node that does internal checking and controls movement. Be aware that this node could be broken down into sub-nodes.
- ChasePlayer - a simpler action that moves towards the player.

CONDITIONS:
- DetectPlayer - a simple detector to see whether the player is close.

The example file "NodeTree.html" uses this library to create a simple scenario, the Space Chase. You control a ship with an antenna using the WSAD keys. Another ship flies a patrol route. If you get too close, it abandons its route to follow you. If you evade it, the patrol ship returns to its route.

This behaviour is achieved with the following behaviour tree:

- AI
	- ActionSelector
		- ChaseSequencer
			- ChaseDetector
			- ChaseAction
		- NavSequencer
			- Waypoint1
			- Waypoint2
			- Waypoint3
			- Waypoint4
			- Waypoint5

The AI system walks down the tree and makes decisions accordingly.

Consider, for example, the case where the player is near the patrol ship. First, the ActionSelector runs, and runs its first child. ChaseSequencer runs, and runs its first child too. ChaseDetector runs and returns with a SUCCESS status. ChaseSequencer continues on a SUCCESS, so it moves on to run ChaseAction. The action is an automatic success, so ChaseSequencer returns with a SUCCESS status. The ActionSelector sees that it has a successful child, and returns without running the NavSequencer.

If the player is far from the patrol ship, something different happens. The ChaseDetector fails, and so does the ChaseSequencer. Because the ActionSelector continues until it finds the end or a SUCCESS, it goes on to the NavSequencer. This runs Waypoint1, which returns RUNNING. NavSequencer bookmarks Waypoint1, and returns SUCCESS; ActionSelector concludes its update. On the next update, the NavSequencer will return immediately to Waypoint1, and so on, until the ship reaches the waypoint and it returns SUCCESS. It then moves on to Waypoint2, which returns RUNNING, and on the next update it will skip Waypoint1 and go on to Waypoint2 immediately.



FUTURE POSSIBILITIES

A full library can include many options. You may wish to check health levels, consult emotional state registers, count ammunition, check for doors or walls, or gather other information. You may seek to run, jump, shoot, turn corners, pursue or be pursued, launch fighters, set a target position, or perform idle animations. This all depends on your game structure.



ACKNOWLEDGEMENTS

This AI system was based on information posted by Bjorn Knafla. This is a great guide to structuring a behaviour tree.
http://www.altdevblogaday.com/2011/02/24/introduction-to-behavior-trees/

Some inspiration was taken from former work done by Vlad at Instinct Entertainment.
http://instinct.co.nz/