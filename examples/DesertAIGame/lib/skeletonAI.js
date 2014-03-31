Kiwi.Plugins.SkeletonAI =
{
	name:"SkeletonAI",
	version:"1.0"
}
Kiwi.PluginManager.register(Kiwi.Plugins.SkeletonAI);

Kiwi.Plugins.SkeletonAI.Actions = {};
Kiwi.Plugins.SkeletonAI.Conditions = {};

Kiwi.Plugins.SkeletonAI.Actions.MoveToLocation = function( params )
{

	Kiwi.Plugins.AITree.AITreeOuterNode.call( this, params );

	this.sprite = params.sprite;
	this.target = params.sprite.targetLocation;
	this.proximityThreshold = 16;
		
	this.run = function()
	{
		if(this.sprite.interrupted){
			this.status = this.STATUS_SUCCESS;
			if(this.sprite.animation.currentAnimation.name!='idle')
				this.sprite.animation.switchTo('idle', true);
			this.sprite.interrupted = false;
		}
		else{
			var distX = this.target[0] - this.sprite.x;
			var distY = this.target[1] - this.sprite.y;
			var dist = Math.sqrt( distX * distX + distY * distY );

			if( dist < this.proximityThreshold )
			{
				if(this.sprite.animation.currentAnimation.name!='idle'+this.sprite.direction)
					this.sprite.animation.switchTo('idle'+this.sprite.direction, true);
				this.status = this.STATUS_SUCCESS;
			}
			else if( dist != 0 )
			{

				var dx = distX / dist;
				var dy = distY / dist;

				this.sprite.x += dx * this.sprite.speed;
				this.sprite.y += dy * this.sprite.speed;

				if(Math.abs(dx) > Math.abs(dy)){
					if(dx < 0){
						this.sprite.direction = 'left';
						if(this.sprite.animation.currentAnimation.name!='moveleft')
							this.sprite.animation.switchTo('moveleft', true);
					}else if(dx > 0){
						this.sprite.direction = 'right';
						if(this.sprite.animation.currentAnimation.name!='moveright')
							this.sprite.animation.switchTo('moveright', true);
					}
				}
				else{
					if(dy < 0){
						this.sprite.direction = 'up';
						if(this.sprite.animation.currentAnimation.name!='moveup')
							this.sprite.animation.switchTo('moveup', true);
					}else if(dy > 0){
						this.sprite.direction = 'down';
						if(this.sprite.animation.currentAnimation.name!='movedown')
							this.sprite.animation.switchTo('movedown', true);
					}
				}

		        console.log(this.sprite.animation.currentAnimation.name);


				this.status = this.STATUS_RUNNING;
			}
		}

	}
	return( this );
}

Kiwi.Plugins.SkeletonAI.Actions.SelectNewLocation = function( params )
{

	Kiwi.Plugins.AITree.AITreeOuterNode.call( this, params );

	this.sprite = params.sprite;
	this.top = params.top;
	this.bottom = params.bottom;
	this.left = params.left;
	this.right = params.right;
		
	this.run = function()
	{

		var distance = Math.random() * 200 + 60;
		var direction = Math.random() * 360;
		
		var dx = Math.cos(direction) * distance;
		var dy = Math.sin(direction) * distance;

		var x = this.sprite.x + dx;
		var y = this.sprite.y + dy;

		if(y > this.sprite.bottom)
			y = this.sprite.bottom;
		if(y < this.sprite.top)
			y = this.sprite.top;
		if(x < this.sprite.left)
			x = this.sprite.left;
		if(x > this.sprite.right)
			x = this.sprite.right;

		this.sprite.targetLocation[0] = x;
		this.sprite.targetLocation[1] = y;

		this.status = this.STATUS_SUCCESS;
	}
	return( this );
}

Kiwi.Plugins.SkeletonAI.Actions.Pause = function( params )
{

	Kiwi.Plugins.AITree.AITreeOuterNode.call( this, params );

	this.sprite = params.sprite;
		
	this.run = function()
	{
		if(this.sprite.animation.currentAnimation.name!='idle'+this.sprite.direction)
		 	this.sprite.animation.switchTo('idle'+this.sprite.direction, true);

		if(this.sprite.pauseTime < 100){
			this.sprite.pauseTime++;
			this.status = this.STATUS_RUNNING;
		}
		else{
			this.sprite.pauseTime = 0;
			this.status = this.STATUS_SUCCESS;
		}

	}
	return( this );
}

Kiwi.Plugins.SkeletonAI.Actions.MoveAwayFromTarget = function( params )
{

	Kiwi.Plugins.AITree.AITreeOuterNode.call( this, params );


	this.sprite = params.sprite;
	this.target = params.target;
		
	this.run = function()
	{
		var distX = this.target.x - this.sprite.x;
		var distY = this.target.y - this.sprite.y;
		var dist = Math.sqrt( distX * distX + distY * distY );
		
		console.log('running away!');

		// if(this.sprite.animation.currentAnimation.name!='move')
		// 	this.sprite.animation.switchTo('move', true);

		var dx = (distX / dist) * -1;
		var dy = (distY / dist) * -1;

		if(Math.abs(dx) > Math.abs(dy)){
			if(dx < 0){
				this.sprite.direction = 'left';
				if(this.sprite.animation.currentAnimation.name!='moveleft')
					this.sprite.animation.switchTo('moveleft', true);
			}else if(dx >= 0){
				this.sprite.direction = 'right';
				if(this.sprite.animation.currentAnimation.name!='moveright')
					this.sprite.animation.switchTo('moveright', true);
			}
		}
		else{
			if(dy < 0){
				this.sprite.direction = 'up';
				if(this.sprite.animation.currentAnimation.name!='moveup')
					this.sprite.animation.switchTo('moveup', true);
			}else if(dy >= 0){
				this.sprite.direction = 'down';
				if(this.sprite.animation.currentAnimation.name!='movedown')
					this.sprite.animation.switchTo('movedown', true);
			}
		}

		this.sprite.x += dx * this.sprite.speed;
		this.sprite.y += dy * this.sprite.speed;

		this.sprite.interrupted = true;
		this.status = this.STATUS_SUCCESS;
		
	

	}
	return( this );
}

Kiwi.Plugins.SkeletonAI.Actions.MoveTowardsTarget = function( params )
{

	Kiwi.Plugins.AITree.AITreeOuterNode.call( this, params );

	this.sprite = params.sprite;
	this.target = params.target;
	this.proximityThreshold = 16;
		
	this.run = function()
	{
		var distX = this.target.x - this.sprite.x;
		var distY = this.target.y - this.sprite.y;
		var dist = Math.sqrt( distX * distX + distY * distY );

		if( dist < this.proximityThreshold )
		{
			if(this.sprite.animation.currentAnimation.name!='idle'+this.sprite.direction)
					this.sprite.animation.switchTo('idle'+this.sprite.direction, true);
		}
		else if( dist != 0 )
		{

			var dx = distX / dist;
			var dy = distY / dist;

			if(Math.abs(dx) > Math.abs(dy)){
				if(dx < 0){
					this.sprite.direction = 'left';
					if(this.sprite.animation.currentAnimation.name!='moveleft')
						this.sprite.animation.switchTo('moveleft', true);
				}else if(dx >= 0){
					this.sprite.direction = 'right';
					if(this.sprite.animation.currentAnimation.name!='moveright')
						this.sprite.animation.switchTo('moveright', true);
				}
			}
			else{
				if(dy < 0){
					this.sprite.direction = 'up';
					if(this.sprite.animation.currentAnimation.name!='moveup')
						this.sprite.animation.switchTo('moveup', true);
				}else if(dy >= 0){
					this.sprite.direction = 'down';
					if(this.sprite.animation.currentAnimation.name!='movedown')
						this.sprite.animation.switchTo('movedown', true);
				}
			}

			this.sprite.x += dx * this.sprite.speed;
			this.sprite.y += dy * this.sprite.speed;
		}

		this.sprite.interrupted = true;
		this.status = this.STATUS_SUCCESS;
	}
	return( this );
}

Kiwi.Plugins.SkeletonAI.Conditions.DetectPlayer = function( params ){

	Kiwi.Plugins.AITree.AITreeOuterNode.call( this, params );

	this.sprite = params.sprite;
	this.target = params.target;
	this.range = params.range;

	this.run = function()
	{
		var distX = this.target.x - this.sprite.transform.x;
		var distY = this.target.y - this.sprite.transform.y;
		var dist = Math.sqrt( distX * distX + distY * distY );	// Pythagoras
		
		// Distance check
		if( dist < this.range )
		{
			// That is, we're within range of the target
			this.status = this.STATUS_SUCCESS;
		}
		else this.status = this.STATUS_FAILURE;
	}
	
	return( this );
}

Kiwi.Plugins.SkeletonAI.Conditions.DetectPlayerItem = function( params ){

	Kiwi.Plugins.AITree.AITreeOuterNode.call( this, params );

	this.target = params.target;
	this.item = params.item;

	this.run = function()
	{
		this.status = this.STATUS_FAILURE;

		for(var i = 0; i < this.target.items.length; i++){
			
			if(this.target.items[i] == this.item){
				this.status = this.STATUS_SUCCESS;
			}
		}
	}
	
	return( this );
}