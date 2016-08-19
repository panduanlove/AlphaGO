function chess(){
    var self=this;
    this.canvas=document.getElementById("canvas");
    this.context=this.canvas.getContext('2d');
    this.regretBtn=document.getElementById("regret-btn");
    this.bootWidth=localStorage.getItem("size")==1?40:30;
    this.bootHeight=this.bootWidth;
    this.canvasWidth=this.bootWidth*15;
    this.canvasHeight=this.bootHeight*15;
    this.me=localStorage.getItem("color")==0?false:true;
    //表示棋盘位置的二维数组
    this.chessBoard=[];
    //定义一个赢法数组
    this.wins=[];
    //赢法种类索引
    this.count=0;
    //定义我和电脑的赢法数组
    this.myWin=[];
    this.computerWin=[];
    //记录每一步棋的位置的数组
    this.myRecord=[];
    this.computerRecord=[];
    //赢法悔棋数组
    this.myWinRegret=[];
    this.computerWinRegret=[];
    this.over=false;
    this.canvas.width=this.canvasWidth;
    this.canvas.height=this.canvasHeight;
    self.drawChessBoard(self.bootWidth,self.bootHeight);

    //将棋盘位置二维数组初始化为0
    this.initChessBoard();
    //初始化赢法数组
    this.initWins();
    //初始化我和电脑的赢法数组
    this.initMeAndComputerWin();
    this.regretBtn.onclick=function(){
        self.regretChess();
    }
    this.canvas.onclick=function(e){
        if(self.over){
            return;
        }
        var x= e.offsetX;
        var y= e.offsetY;
        var i=Math.floor(x/self.bootWidth);
        var j=Math.floor(y/self.bootHeight);
        if(self.chessBoard[i][j]==0){

            self.oneStep(i,j,self.me);
            self.myRecord.push({"x":i,"y":j});
            //代表这个位置是我的棋子
            self.chessBoard[i][j]=1;
            var useK=[];
            for(var k=0;k<self.count;k++){
                if(self.wins[i][j][k]){
                    useK.push(k);
                    self.myWin[k]++;
                    //表示这种赢法计算机不可能赢了
                    self.computerWin[k]+=6;
                    if(self.myWin[k]==5){
                        self.over=true;
                        setTimeout(function(){
                            window.alert("你赢了");
                            self.changeScore("me");
                            self.upDateBoard();
                        },50);
                    }
                }
            }
            self.myWinRegret.push(useK);
            //电脑落子
            if(!self.over){
                self.me=!self.me;
                self.computerAI();
            }
        }
    }
}


chess.prototype.drawChessBoard=function(bootWidth,bootHeight){
    this.context.beginPath();
    this.context.strokeStyle="#afafaf";
    for(var i=0;i<15;i++){
        this.context.moveTo(
            bootWidth/2+i*bootWidth,
            bootHeight/2);
        this.context.lineTo(
            bootWidth/2+i*bootWidth,
            this.canvasHeight-bootHeight/2);
        this.context.moveTo(
            bootWidth/2,
            i*bootHeight+bootHeight/2);
        this.context.lineTo(
            this.canvasWidth-bootWidth/2,
            i*bootHeight+bootHeight/2);
    }
    this.context.stroke();
    this.context.closePath();
}
chess.prototype.initChessBoard=function(){
    for(var i=0;i<15;i++){
        this.chessBoard[i]=[];
        for(var j=0;j<15;j++){
            this.chessBoard[i][j]=0;
        }
    }
}
chess.prototype.oneStep=function(i,j,me){
    //i、j是索引，me表示黑棋还是白棋,me为true我方是黑棋
    this.context.beginPath();
    this.context.arc(
        this.bootWidth/2+i*this.bootWidth,
        this.bootWidth/2+j*this.bootWidth,
        this.bootWidth/2-2,
        0,
        2*Math.PI);
    this.context.closePath();
    var gradient=this.context.createRadialGradient(
        this.bootWidth/2+i*this.bootWidth+2,
        15+j*this.bootWidth-2,
        this.bootWidth/2-2,
        15+i*this.bootWidth+2,
        15+j*this.bootWidth-2,
        0);
    if(me){
        gradient.addColorStop(0,"#0a0a0a");
        gradient.addColorStop(1,"#636766");
    }else{
        gradient.addColorStop(0,"#d1d1d1");
        gradient.addColorStop(1,"#f9f9f9");
    }
    this.context.fillStyle=gradient;
    this.context.fill();
}
chess.prototype.initWins=function(){
    for(var i=0;i<15;i++){
        this.wins[i]=[];
        for(var j=0;j<15;j++){
            this.wins[i][j]=[];
        }
    }
    //所有连成竖线的赢法
    for(var i=0;i<15;i++){
        for(var j=0;j<11;j++){
            for(var k=0;k<5;k++){
                this.wins[i][j+k][this.count]=true;
            }
            this.count++;
        }
    }
    //所有连成横线的赢法
    for(var i=0;i<11;i++){
        for(var j=0;j<15;j++){
            for(var k=0;k<5;k++){
                this.wins[i+k][j][this.count]=true;
            }
            this.count++;
        }
    }
    //所有连成斜线的赢法
    for(var i=0;i<11;i++){
        for(var j=0;j<11;j++){
            for(var k=0;k<5;k++){
                this.wins[i+k][j+k][this.count]=true;
            }
            this.count++;
        }
    }
    //所有连成反斜线的赢法
    for(var i=0;i<11;i++){
        for(var j=14;j>3;j--){
            for(var k=0;k<5;k++){
                this.wins[i+k][j-k][this.count]=true;
            }
            this.count++;
        }
    }
}

chess.prototype.initMeAndComputerWin=function(){
    for(var i=0;i<this.count;i++){
        this.myWin[i]=0;
        this.computerWin[i]=0;
    }
}

chess.prototype.computerAI=function(){
    //我方得分的二维数组
    var myScore=[];
    var computerScore=[];
    //电脑得分的二维数组
    var max=0;
    //保存最高的分数
    var u= 0,v=0;
    //保存最高分的点的坐标
    for(var i=0;i<15;i++){
        myScore[i]=[];
        computerScore[i]=[];
        for(var j=0;j<15;j++){
            myScore[i][j]=0;
            computerScore[i][j]=0;
        }
    }
    for(var i=0;i<15;i++){
        for(var j=0;j<15;j++){
            if(this.chessBoard[i][j]==0){
                //遍历所有赢法
                for(var k=0;k<this.count;k++){
                    if(this.wins[i][j][k]){
                        //判断我方在该位置落子好不好，加的分数越多代表越好
                        if(this.myWin[k]==1){
                            myScore[i][j]+=1;
                        }else if(this.myWin[k]==2){
                            myScore[i][j]+=100;
                        }else if(this.myWin[k]==3){
                            myScore[i][j]+=10000;
                        }else if(this.myWin[k]==4){
                            myScore[i][j]+=1000000;
                        }

                        //判断电脑在该位置落子好不好，加的分数越多代表越好
                        if(this.computerWin[k]==1){
                            computerScore[i][j]+=2;
                        }else if(this.computerWin[k]==2){
                            computerScore[i][j]+=220;
                        }else if(this.computerWin[k]==3){
                            computerScore[i][j]+=22000;
                        }else if(this.computerWin[k]==4){
                            computerScore[i][j]+=22000000;
                        }
                    }
                }
                //判断我的最高分位置
                if(myScore[i][j]>max){
                    max=myScore[i][j];
                    u=i;
                    v=j;
                }else if(myScore[i][j]==max){
                    if(computerScore[i][j]>computerScore[u][v]){
                        u=i;
                        v=j;
                    }
                }
                //判断电脑的最高分位置
                if(computerScore[i][j]>max){
                    max=computerScore[i][j];
                    u=i;
                    v=j;
                }else if(computerScore[i][j]==max){
                    if(myScore[i][j]>myScore[u][v]){
                        u=i;
                        v=j;
                    }
                }

            }
        }
    }
    this.oneStep(u,v,this.me);
    this.computerRecord.push({"x":u,"y":v});
    //代表这个位置是计算机的棋子
    this.chessBoard[u][v]=2;
    //记录每一步棋之后变化的一组k
    var useK=[];
    for(var k=0;k<this.count;k++){
        if(this.wins[u][v][k]){
            useK.push(k);
            this.computerWin[k]++;
            //表示这种赢法我不可能赢了
            this.myWin[k]+=6;
            if(this.computerWin[k]==5){
                this.over=true;
                var self=this;
                setTimeout(function(){
                    window.alert("电脑赢了");
                    self.changeScore("computer");
                    self.upDateBoard();
                },50);
            }
        }
    }
    this.computerWinRegret.push(useK);
    if(!this.over){
        this.me=!this.me;
    }
}
chess.prototype.upDateBoard=function(){
    new chess();
}
chess.prototype.regretChess=function(){
    if(this.myRecord.length){
        var self=this;
        var myChessX=this.myRecord[this.myRecord.length-1].x,
            myChessY=this.myRecord[this.myRecord.length-1].y,
            computerChessX=this.computerRecord[this.computerRecord.length-1].x,
            computerChessY=this.computerRecord[this.computerRecord.length-1].y;
        this.context.clearRect(
            myChessX*self.bootWidth,
            myChessY*self.bootHeight,
            self.bootWidth,
            self.bootHeight);
        this.context.clearRect(
            computerChessX*self.bootWidth,
            computerChessY*self.bootHeight,
            self.bootWidth,
            self.bootHeight);
        //把清掉的横线和竖线再补上
        this.context.beginPath();
        this.context.strokeStyle="#afafaf";
        //我的棋子的横竖线
        this.context.moveTo(
            myChessX*self.bootWidth+self.bootWidth/2,
            myChessY*self.bootHeight);
        this.context.lineTo(
            myChessX*self.bootWidth+self.bootWidth/2,
            myChessY*self.bootHeight+self.bootHeight
        );
        this.context.moveTo(
            myChessX*self.bootWidth,
            myChessY*self.bootHeight+self.bootHeight/2);
        this.context.lineTo(
            myChessX*self.bootWidth+self.bootWidth,
            myChessY*self.bootHeight+self.bootHeight/2
        );
        //电脑棋子的横竖线
        this.context.moveTo(
            computerChessX*self.bootWidth+self.bootWidth/2,
            computerChessY*self.bootHeight);
        this.context.lineTo(
            computerChessX*self.bootWidth+self.bootWidth/2,
            computerChessY*self.bootHeight+self.bootHeight
        );
        this.context.moveTo(
            computerChessX*self.bootWidth,
            computerChessY*self.bootHeight+self.bootHeight/2);
        this.context.lineTo(
            computerChessX*self.bootWidth+self.bootWidth,
            computerChessY*self.bootHeight+self.bootHeight/2
        );
        this.context.stroke();
        this.context.closePath();
        //悔棋之后将去掉的棋子位置的chessBoard重置为0，表示此处已无棋子
        this.chessBoard[myChessX][myChessY]=0;
        this.chessBoard[computerChessX][computerChessY]=0;
        //还要把上一步棋涉及到的赢法逐个减1
        //我的部分
        var myLastGroup=this.myWinRegret[this.myWinRegret.length-1];
        var computerLastGroup=this.computerWinRegret[this.computerWinRegret.length-1];
        for(var i=0;i<myLastGroup.length;i++){
            if(this.myWin[myLastGroup[i]]>0){
                this.myWin[myLastGroup[i]]--;
            }
            if(this.computerWin[myLastGroup[i]]>5){
                this.computerWin[myLastGroup[i]]-=6;
            }
            //console.log(this.computerWin[computerLastGroup[i]]);
        }
        //电脑的部分
        for(var i=0;i<computerLastGroup.length;i++){
            if(this.computerWin[computerLastGroup[i]]>0){
                this.computerWin[computerLastGroup[i]]--;
            }
            //console.log(this.myWin[myLastGroup[i]]);
            if(this.myWin[computerLastGroup[i]]>5){
              this.myWin[computerLastGroup[i]]-=6;
            }
        }
    }
}
chess.prototype.changeScore=function(who){
    var score=document.getElementById(who+"-score");
    score.innerHTML=parseInt(score.innerHTML)+1;
}