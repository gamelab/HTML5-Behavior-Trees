/*
//
// Behaviour Node Tree
// Plugin for Kiwi.js
//
// Benjamin D. Richards 2013.1220
// Working at Instinct Entertainment
//
*/


Kiwi.Plugins.AITree = 
{
	name:"AITree",
	version:"1.0"
}
Kiwi.PluginManager.register( Kiwi.Plugins.AITree );


/*
Core Node Declarations

These are specified in a block for portability and encapsulation.
The core block can be extracted or replaced and remain functional.
Namespaces may be overly verbose outside the Kiwi environment.
*/


// AI Tree
// A container for behaviour tree nodes.
// Attach this to your game object.
Kiwi.Plugins.AITree.AI = function()
{
	// Root node
	this.root = undefined;
	// Unique children census
	this.uniqueChildren = [];
	
	// Update
	this.update = function()
	{
		// Run the tree
		var status = 4;	// Error
		if( this.root.update != undefined )
		{
			status = this.root.update();
		}
		
		// Reset the tree
		for( var i = 0;  i < this.uniqueChildren.length;  i++ )
		{
			this.uniqueChildren[i].reset();
		}
		
		return( status );
	}
	
	// Register
	// Ensures all unique children are listed in the census
	// Is the only part of the tree that can originate a "true" response, which terminates
	// any updateCensus signals.
	this.updateCensus = function()
	{
		// Get complete population list
		var descendants = this.root.getDescendants();
		// Add unique population elements to census
		this.uniqueChildren = [ this.root ];
		for( var i = 0;  i < descendants.length;  i++ )
		{
			if( this.uniqueChildren.indexOf( descendants[i] ) == -1 )
			{
				// That is, the descendant is not yet represented in the census
				this.uniqueChildren.push( descendants[i] );
			}
		}
		// Signal completion
		return( true );
	}
	
	// Set Root
	// Special method for attaching root child to tree
	// Use this method rather than setting root directly
	// It rebuilds necessary information
	this.setRoot = function( candidate )
	{
		if( candidate != undefined )
		{
			this.root = candidate;
			this.root.addParent( this );	// Allow root to signal tree
			this.updateCensus();
		}
	}
	
	// Add Child
	// Alias of SetRoot
	this.addChild = function( candidate )
	{
		return( this.setRoot( candidate ) );
	}
	
	// Has Ancestor
	// Terminates a node-based ancestor seek
	this.hasAncestor = function( candidate )
	{
		return( false );
	}
	
	return( this );
}


// Outer Node
// A template for the outer nodes that perform actions or check conditions.
// Because these are the simplest nodes, they are also the template for other types.
Kiwi.Plugins.AITree.AITreeOuterNode = function( params )
{
	this.name = "untitledNode";
	// Parameters
	if( params != undefined )
	if( params.name != undefined )
	this.name = params.name;
	
	// Status types
	this.STATUS_READY = 0;
	this.STATUS_RUNNING = 1;
	this.STATUS_SUCCESS = 2;
	this.STATUS_FAILURE = 3;
	this.STATUS_ERROR = 4;
	
	// Status - this regulates traversal
	this.status = this.STATUS_READY;
	this.runningDirty = false;	// Flag is TRUE when it's just returned RUNNING status
	this.runsParent = true;		// Flag is TRUE when this passes RUNNING condition up the tree
	
	// Parents
	this.parents = [];
	
	// Update
	// Core functionality
	// Returns status
	this.update = function()
	{
		this.onUpdate();
		this.run();
		if( this.status == this.STATUS_RUNNING )	this.runningDirty = true;
		else										this.runningDirty = false;
		return( this.status );
	}
	
	// On Update
	// Override this method to make the node do something
	// Intended for generic Inner Node behaviours
	this.onUpdate = function()
	{
		// Code goes here
	}
	
	// Run
	// Override this method to make the node do something
	// Intended for specific, unique node behaviours
	this.run = function()
	{
		// Code goes here
	}
	
	// Reset
	// Called at the end of every frame to refresh the tree for a fresh traversal
	this.reset = function()
	{
		if( this.status == this.STATUS_RUNNING	&&	this.runningDirty )
		{
			// Running nodes stay running
			// But only if they have run this update
			// A node that doesn't run next update will be clean, and set to READY
			this.runningDirty = false;
			return;
		}
		if( this.status == this.STATUS_ERROR )
		{
			// Log all errors, but still reset
			console.log( "Error detected in " + this.name, this );
		}
		this.status = this.STATUS_READY;
	}
	
	// Add Parent
	// DO NOT CALL DIRECTLY - use addChild on the parent, which will do the jobs this doesn't
	// Registers unique parents
	// Does not check for cycling
	// Returns False if it already found that parent
	this.addParent = function( candidate )
	{
		if( this.parents.indexOf( candidate ) == -1 )
		{
			// That is, the candidate is not already a parent
			this.parents.push( candidate );
			return( true );
		}
		return( false );
	}
	
	// Remove Parent
	// DO NOT CALL DIRECTLY - use removeChild on the parent
	// Returns True if it found the parent and deregistered it, False if not
	this.removeParent = function( candidate )
	{
		var index = this.parents.indexOf( candidate );
		if( index != -1 )
		{
			// That is, the candidate is listed
			this.parents.splice( index, 1 );
			return( true );
		}
		return( false );
	}
	
	// Update Census
	// Blind signal to update the master tree census
	// Returns True when it gets to the master tree to facilitate fast completion
	// This is called automatically when necessary
	this.updateCensus = function()
	{
		for( var i = 0;  i < this.parents.length;  i++ )
		{
			var response = this.parents[i].updateCensus();
			if( response ) return( true );
		}
		return( false );
	}
	
	return( this );
}


// Inner Node
// A template for the inner nodes that facilitate tree traversal.
Kiwi.Plugins.AITree.AITreeInnerNode = function( params )
{
	// AITreeInnerNode inherits status, parents, update, run, and reset from AITreeOuterNode
	Kiwi.Plugins.AITree.AITreeOuterNode.call( this, params );
	
	this.runsParent = false;	// Does not convey RUNNING status to parents
	
	// Children
	this.children = [];
	// Child bookmarked as running last update
	// Stored as an object to simplify shuffle behaviours
	this.currentlyRunningNode = undefined;
	
	this.shuffle = false;
	// Parameters
	if( params != undefined )
	if( params.shuffle )
	this.shuffle = params.shuffle;
	
	// On Update
	// Overrides default
	// Shared inner node functions
	this.onUpdate = function()
	{
		// Special functionality: shuffle the children
		if( this.shuffle )	this.shuffleChildren();
	}
	
	// Add Child
	// Passes a child node as candidate for inclusion.
	// Checks for validity - a child cannot be its own parent/ancestor.
	// Returns True if successful, False if this is an illegal child.
	// Candidate is only appended if it is legal.
	// Always use Add Child to add children; 
	//  direct array access or addParent do not prevent cycling.
	this.addChild = function( candidate )
	{
		// Sanitise inputs: avoid null or duplicate entries
		if( candidate == undefined	||	this.children.indexOf( candidate ) != -1 ) return;
		// Cycling check
		if( this.hasAncestor( candidate )	||	this === candidate )
		{
			// Illegal candidate
			return( false );
		}
		// Accept legal candidates
		this.children.push( candidate );
		candidate.addParent( this );
		// Register in tree census
		this.updateCensus();
		// Signal legal success
		return( true );
	}
	
	// Remove Child
	// Attempts to remove a child node.
	// Checks for validity: does the child actually exist?
	// Then attempts to update tree census
	// Always use this to deregister children, as it automatically updates tree data
	this.removeChild = function( candidate )
	{
		// Deregister childhood
		var index = this.children.indexOf( candidate );
		if( index != -1 )
		{
			// That is, it is a valid child and may be removed
			this.children.splice( index, 1 );
			// Deregister parenthood, ignoring returns because either way it's not a parent
			candidate.removeParent( this );
			// Rebuild tree census
			this.updateCensus();
		}
	}
	
	// Shuffle Children
	// Reorders the child array to create random output
	// Because of this behaviour, it is recommended that all node access be via Object, 
	//  not an array index.
	this.shuffleChildren = function()
	{
		var newChildren = [];
		while( 0 < this.children.length )
		{
			var i = Math.floor( Math.random() * this.children.length );
			newChildren.push( this.children[i] );
			this.children.splice( i, 1 );
		}
		this.children = newChildren;
	}
	
	// Has Ancestor
	// Recursive search for a particular node
	this.hasAncestor = function( candidate )
	{
		if( this === candidate )
		{
			// Found a match
			return( true );
		}
		for( var i = 0;  i < this.parents.length;  i++ )
		{
			var r = this.parents[i].hasAncestor( candidate );
			if( r )	return( true );
		}
		return( false );
	}
	
	// Get Descendants
	// Recursive census method
	// Returns all children and subsequent children
	// Does not eliminate duplicates
	this.getDescendants = function()
	{
		var descendants = [];
		for( var i = 0;  i < this.children.length;  i++ )
		{
			descendants.push( this.children[i] );
			if( this.children[i].getDescendants != undefined )
			{
				descendants = descendants.concat( this.children[i].getDescendants() );
			}
		}
		return( descendants );
	}
	
	return( this );
}


// Sequencer Node
// Inner node; steps through children until it finds a FAILURE or finishes its run.
// Upon finding a RUNNING node it also returns RUNNING and resumes from that point next update.
// Succeeds if it completes the run, fails if it finds a failure.
Kiwi.Plugins.AITree.Sequencer = function( params )
{
	// Inherit from Inner Node
	Kiwi.Plugins.AITree.AITreeInnerNode.call( this, params );
	
	// Run override
	this.run = function()
	{
		var start = 0;
		if( this.currentlyRunningNode != undefined )
		{
			var currentlyRunningIndex = this.children.indexOf( this.currentlyRunningNode );
			if( currentlyRunningIndex != -1 )
			{
				// Skip straight to the currently running node
				start = currentlyRunningIndex;
			}
		}
		for( var i = start;  i < this.children.length;  i++ )
		{
			var output = this.children[i].update();
			if( output == this.STATUS_RUNNING )
			{
				if( this.children[i].runsParent )
				{
					// The child is still running, so this node is running too
					this.status = this.STATUS_RUNNING;
					this.currentlyRunningNode = this.children[i];
				}
				else
				{
					// Non-contagious run; return SUCCESS
					this.status = this.STATUS_SUCCESS;
					this.currentlyRunningNode = undefined;
				}
				return;
			}
			else this.currentlyRunningNode = undefined;	// Not running
			if( output == this.STATUS_FAILURE )
			{
				// Task completed
				this.status = this.STATUS_FAILURE;
				return;
			}
		}
		// No significant results? Then this pass finishes as a success.
		this.currentlyRunningNode = undefined;	// Not running
		this.status = this.STATUS_SUCCESS;
	}
	
	return( this );
}


// Selector Node
// Inner node; steps through children until it finds a SUCCESS or finishes its run.
// Upon finding a RUNNING node it also returns RUNNING and resumes from that point next update.
// Succeeds if it finds a successful child, fails if it completes the run.
Kiwi.Plugins.AITree.Selector = function( params )
{
	// Inherit from Inner Node
	Kiwi.Plugins.AITree.AITreeInnerNode.call( this, params );
	
	// Run override
	this.run = function()
	{
		var start = 0;
		if( this.currentlyRunningNode != undefined )
		{
			var currentlyRunningIndex = this.children.indexOf( this.currentlyRunningNode );
			if( currentlyRunningIndex != -1 )
			{
				// Skip straight to the currently running node
				start = currentlyRunningIndex;
			}
		}
		for( var i = start;  i < this.children.length;  i++ )
		{
			var output = this.children[i].update();
			if( output == this.STATUS_RUNNING )
			{
				if( this.children[i].runsParent )
				{
					// The child is still running, so this node is running too
					this.status = this.STATUS_RUNNING;
					this.currentlyRunningNode = this.children[i];
				}
				else
				{
					// Non-contagious run; return SUCCESS
					this.status = this.STATUS_SUCCESS;
					this.currentlyRunningNode = undefined;
				}
				return;
			}
			else this.currentlyRunningNode = undefined;	// Not running
			if( output == this.STATUS_SUCCESS )
			{
				// Task completed
				this.status = this.STATUS_SUCCESS;
				return;
			}
		}
		// No significant results? Then this pass finishes as a failure.
		this.currentlyRunningNode = undefined;	// Not running
		this.status = this.STATUS_FAILURE;
	}
	
	return( this );
}


// Until Failure Node
// Inner node; steps through children until it finds a FAILURE.
// Upon finding a RUNNING node it also returns RUNNING and resumes from that point next update.
// Succeeds if it finds a failure. Does not have a fail state.
// CAUTION: This node can loop indefinitely. Be sure to provide it with an escape condition.
Kiwi.Plugins.AITree.UntilFailure = function( params )
{
	// Inherit from Inner Node
	Kiwi.Plugins.AITree.AITreeInnerNode.call( this, params );
	
	// Run override
	this.run = function()
	{
		var i = 0;
		if( this.currentlyRunningNode != undefined )
		{
			var currentlyRunningIndex = this.children.indexOf( this.currentlyRunningNode );
			if( currentlyRunningIndex != -1 )
			{
				// Skip straight to the currently running node
				i = currentlyRunningIndex;
			}
		}
		while( 0 < this.children.length )	// Essentially a "while true"
		{
			var output = this.children[i].update();
			if( output == this.STATUS_RUNNING )
			{
				if( this.children[i].runsParent )
				{
					// The child is still running, so this node is running too
					this.status = this.STATUS_RUNNING;
					this.currentlyRunningNode = this.children[i];
				}
				else
				{
					// Non-contagious run; return SUCCESS
					this.status = this.STATUS_SUCCESS;
					this.currentlyRunningNode = undefined;
				}
				return;
			}
			else this.currentlyRunningNode = undefined;	// Not running
			if( output == this.STATUS_FAILURE )
			{
				// Task completed
				this.status = this.STATUS_SUCCESS;
				return;
			}
			// Iterate and loop
			i++;
			if( this.children.length <= i)	i = 0;
		}
	}
	
	return( this );
}


// Until Success Node
// Inner node; steps through children until it finds a SUCCESS.
// Upon finding a RUNNING node it also returns RUNNING and resumes from that point next update.
// Succeeds if it finds a successful child. Does not have a fail state.
// CAUTION: This node can loop indefinitely. Be sure to provide it with an escape condition.
Kiwi.Plugins.AITree.UntilSuccess = function( params )
{
	// Inherit from Inner Node
	Kiwi.Plugins.AITree.AITreeInnerNode.call( this, params );
	
	// Run override
	this.run = function()
	{
		var i = 0;
		if( this.currentlyRunningNode != undefined )
		{
			var currentlyRunningIndex = this.children.indexOf( this.currentlyRunningNode );
			if( currentlyRunningIndex != -1 )
			{
				// Skip straight to the currently running node
				i = currentlyRunningIndex;
			}
		}
		while( 0 < this.children.length )	// Essentially a "while true"
		{
			var output = this.children[i].update();
			if( output == this.STATUS_RUNNING )
			{
				if( this.children[i].runsParent )
				{
					// The child is still running, so this node is running too
					this.status = this.STATUS_RUNNING;
					this.currentlyRunningNode = this.children[i];
				}
				else
				{
					// Non-contagious run; return SUCCESS
					this.status = this.STATUS_SUCCESS;
					this.currentlyRunningNode = undefined;
				}
				return;
			}
			else this.currentlyRunningNode = undefined;	// Not running
			if( output == this.STATUS_SUCCESS )
			{
				// Task completed
				this.status = this.STATUS_SUCCESS;
				return;
			}
			// Iterate and loop
			i++;
			if( this.children.length <= i)	i = 0;
		}
	}
	
	return( this );
}


// Until Time Node
// Inner node; steps through children until the clock runs out.
// Upon finding a RUNNING node it also returns RUNNING and resumes from that point next update.
// Succeeds after a certain time. Does not have a fail state.
// Unlike other Until nodes, this one has a built-in escape condition.
Kiwi.Plugins.AITree.UntilTime = function( params )
{
	// Inherit from Inner Node
	Kiwi.Plugins.AITree.AITreeInnerNode.call( this, params );
	
	// Timer
	this.timerDuration = 100;	// Measured in milliseconds
	// Parameters
	if( params != undefined )
	if( params.timerDuration != undefined )
	this.timerDuration = params.timerDuration;
	
	// Run override
	this.run = function()
	{
		// Initiate timer
		var endTime = this.getTime() + this.timerDuration;
		
		// Resume running node
		var i = 0;
		if( this.currentlyRunningNode != undefined )
		{
			var currentlyRunningIndex = this.children.indexOf( this.currentlyRunningNode );
			if( currentlyRunningIndex != -1 )
			{
				// Skip straight to the currently running node
				i = currentlyRunningIndex;
			}
		}
		
		while( this.getTime() < endTime )
		{
			var output = this.children[i].update();
			if( output == this.STATUS_RUNNING )
			{
				if( this.children[i].runsParent )
				{
					// The child is still running, so this node is running too
					this.status = this.STATUS_RUNNING;
					this.currentlyRunningNode = this.children[i];
				}
				else
				{
					// Non-contagious run; return SUCCESS
					this.status = this.STATUS_SUCCESS;
					this.currentlyRunningNode = undefined;
				}
				return;
			}
			// Iterate and loop
			i++;
			if( this.children.length <= i)	i = 0;
		}
		this.status = this.STATUS_SUCCESS;
	}
	
	// Get Time
	// Uses various methods to seek the best available time in millis.
	this.getTime = function()
	{
		if( window.performance.now )	return( window.performance.now() );
		if( window.performance.webkitNow )	return( window.performance.webkitNow() );
		return( new Date().getTime() );
	}
	
	return( this );
}


/*
End Core Node Declarations
*/