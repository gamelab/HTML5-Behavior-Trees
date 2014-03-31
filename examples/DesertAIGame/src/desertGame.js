var myGame = new Kiwi.Game();

var myState = new Kiwi.State('myState');

myState.create = function(){
	Kiwi.State.prototype.create.call(this);

    this.background = new Kiwi.GameObjects.StaticImage(this, this.textures['background'], 0, 0);

    this.skeleton = new Skeleton(this, this.textures['skeleton'], 100, 300, -10, 735-150+60, -30, 437-117+5);

    this.character = new Kiwi.GameObjects.Sprite(this, this.textures['character'], 500, 50);
    this.character.items = [];
    this.character.direction = 'down';
    this.character.animation.add('idledown', [0], 0.1, false);
    this.character.animation.add('idleleft', [14], 0.1, false);
    this.character.animation.add('idleright', [21], 0.1, false);
    this.character.animation.add('idleup', [7], 0.1, false);
    this.character.animation.add('moveleft', [15,16,17,18,19,20], 0.15, true);
    this.character.animation.add('moveup', [8,9,10,11,12,13], 0.15, true);
    this.character.animation.add('movedown', [1,2,3,4,5,6], 0.15, true);
    this.character.animation.add('moveright', [22,23,24,25,26,27], 0.15, true);
    this.character.animation.play('idle'+this.character.direction);
    this.character.colBox = new Kiwi.Geom.Rectangle(this.character.x+62, this.character.y+42, 37, 66);
    this.character.skullTimer = 0;

    this.singleSkull = new Kiwi.GameObjects.StaticImage(this, this.textures['singleSkull'], 0,0);
    this.singleSkull.visibility = false;

    this.skulls = new Kiwi.Group(this);
    this.addSkull();

    this.addChild(this.background);

    this.addChild(this.skulls);
    this.addChild(this.skeleton);
    this.addChild(this.character);
    this.addChild(this.singleSkull);

    this.leftKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.A);
    this.rightKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.D);
    this.downKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.S);
    this.upKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.W);

    var skeletonTree = new Kiwi.Plugins.AITree.AI();

    var moveTo = new Kiwi.Plugins.SkeletonAI.Actions.MoveToLocation({
        sprite: this.skeleton
    });
    var selectLocation = new Kiwi.Plugins.SkeletonAI.Actions.SelectNewLocation({
        sprite:this.skeleton,
        top: 0,
        bottom: 512,
        left: 0, 
        right: 567
    });
    var pause = new Kiwi.Plugins.SkeletonAI.Actions.Pause({
        sprite:this.skeleton
    });
    var detectPlayer = new Kiwi.Plugins.SkeletonAI.Conditions.DetectPlayer({
        sprite: this.skeleton,
        target: this.character,
        range: 150
    });
    var moveTowardsPlayer = new Kiwi.Plugins.SkeletonAI.Actions.MoveTowardsTarget({
        sprite: this.skeleton,
        target: this.character
    });
    var detectItem = new Kiwi.Plugins.SkeletonAI.Conditions.DetectPlayerItem({
        target: this.character,
        item: "skull"
    });
    var moveAwayFromPlayer = new Kiwi.Plugins.SkeletonAI.Actions.MoveAwayFromTarget({
        sprite:this.skeleton,
        target:this.character
    })

    var randomMoveSequence = new Kiwi.Plugins.AITree.Sequencer({name:"randomMoveSequence"});
    randomMoveSequence.addChild(selectLocation);
    randomMoveSequence.addChild(moveTo);
    randomMoveSequence.addChild(pause);

    var towardPlayerSequence = new Kiwi.Plugins.AITree.Sequencer({name:"towardPlayerSequence"});
    towardPlayerSequence.addChild(detectItem);
    towardPlayerSequence.addChild(moveAwayFromPlayer);

    var playerSelector = new Kiwi.Plugins.AITree.Selector({name:"playerSelector"});
    playerSelector.addChild(towardPlayerSequence);
    playerSelector.addChild(moveTowardsPlayer);

    var playerSequence = new Kiwi.Plugins.AITree.Sequencer({name:"playerSequence"});
    playerSequence.addChild(detectPlayer);
    playerSequence.addChild(playerSelector);

    var actionSelector = new Kiwi.Plugins.AITree.Selector({name:"actionSelector"});

    actionSelector.addChild(playerSequence);
    actionSelector.addChild(randomMoveSequence);

    skeletonTree.addChild(actionSelector);

    this.skeleton.ai = skeletonTree;

}

myState.addSkull = function(){

    var skull = new Kiwi.GameObjects.Sprite(this, this.textures['skull'], Math.random()*500+100, Math.random()*350+60);
    skull.animation.add('blink', [0,1,2,3,4,5], 0.1, true);
    skull.animation.play('blink');
    this.skulls.addChild(skull);
}


myState.update = function(){
	Kiwi.State.prototype.update.call(this);

    this.character.colBox = new Kiwi.Geom.Rectangle(this.character.x+62, this.character.y+42, 37, 66);

//-10, 735-150+60, -30, 437-117+15
        if(this.leftKey.isDown){
            this.character.x-=3;
            this.character.direction = 'left';
            if(this.character.animation.currentAnimation.name!=('move'+this.character.direction))
                this.character.animation.switchTo('move'+this.character.direction, true);
            if(this.character.x<-10)
                this.character.x = -10;
        }
        else if(this.rightKey.isDown){
            this.character.x+=3;
            this.character.direction = 'right';
            if(this.character.animation.currentAnimation.name!=('move'+this.character.direction))
                this.character.animation.switchTo('move'+this.character.direction, true);
            if(this.character.x>735-150+60)
                this.character.x = 735-150+60;
        }
        else if(this.downKey.isDown){
            this.character.y+=3;
            this.character.direction = 'down';
            if(this.character.animation.currentAnimation.name!=('move'+this.character.direction))
                this.character.animation.switchTo('move'+this.character.direction, true);
            if(this.character.y>437-117+13)
                this.character.y = 437-117+13;
        }
        else if(this.upKey.isDown){
            this.character.y-=3;
            this.character.direction = 'up';
            if(this.character.animation.currentAnimation.name!=('move'+this.character.direction))
                this.character.animation.switchTo('move'+this.character.direction, true);
            if(this.character.y<-20)
                this.character.y = -20;
        }else{
        if(this.character.animation.currentAnimation.name!=('idle'+this.character.direction))
                this.character.animation.switchTo('idle'+this.character.direction, true);
    }
    if(this.skulls.members.length > 0){
        if(this.character.colBox.intersects(this.skulls.members[0].box.hitbox)){
            this.character.items[0] = 'skull';
            this.skulls.members[0].destroy();
        }
    }else{
        this.character.skullTimer++;
        if(this.character.skullTimer > 400){
            this.character.skullTimer = 1;
            this.addSkull();
            this.character.items[0] = '';
        }
    }

    this.singleSkull.x = this.character.x+45;
    this.singleSkull.y = this.character.y-20;

    if(this.character.items[0]=='skull'){
        this.singleSkull.visibility=true;
        this.singleSkull.alpha = 1 - (this.character.skullTimer/400);
    }else
        this.singleSkull.visibility=false;

}

myGame.states.addState(myState);
myGame.states.addState(loadingState);
myGame.states.addState(preloader, true);
