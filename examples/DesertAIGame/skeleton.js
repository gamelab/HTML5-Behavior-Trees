var Skeleton = function(state, texture, x, y, l, r, t, b){
	Kiwi.GameObjects.Sprite.call(this, state, texture, x, y, false);

	this.animation.add('idledown', [0], 0.1, false);
	this.animation.add('idleleft', [14], 0.1, false);
	this.animation.add('idleright', [21], 0.1, false);
	this.animation.add('idleup', [7], 0.1, false);
	this.animation.add('moveleft', [15,16,17,18,19,20], 0.15, true);
	this.animation.add('moveup', [8,9,10,11,12,13], 0.15, true);
	this.animation.add('movedown', [1,2,3,4,5,6], 0.15, true);
	this.animation.add('moveright', [22,23,24,25,26,27], 0.15, true);
	this.animation.play('idledown');

	this.left = l;
	this.right = r;
	this.top = t;
	this.bottom = b;

	this.speed = 1.5;
	this.targetLocation = [20,200];
	this.pauseTime = 0;
	this.interrupted = false;
	this.direction = 'up'

	Skeleton.prototype.update = function(){
		Kiwi.GameObjects.Sprite.prototype.update.call(this);
		this.ai.update();

		if(this.x < this.left)
			this.x = this.left;
		else if(this.x > this.right)
			this.x = this.right;
		if(this.y < this.top)
			this.y = this.top;
		else if(this.y > this.bottom)
			this.y = this.bottom;
	}
}
Kiwi.extend(Skeleton, Kiwi.GameObjects.Sprite);