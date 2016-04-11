/**
 * Created by lenovo on 2016/4/10.
 */
window.onload = function(){
    var gobang = new Gobang();
    gobang.init({
        query : 'gobang',
        width : 500,
        height : 500
    });
}
function Gobang(){}
//初始化
Gobang.prototype.init = function(options){
    //默认配置参数
    this.settings = {
        query : '',
        width : 450,
        height : 450,
        gap : 15
    }
    //设置配置参数
    this.extend(this.settings,options);
    if(!this.settings.query){
        throw '没有写选择器';
    }
    //获取元素，设置canvas上下文及宽高
    this.cnavas = document.getElementById(this.settings.query);
    this.context = this.cnavas.getContext('2d');
    this.cnavas.width = this.settings.width;
    this.cnavas.height = this.settings.height;
    //绘制棋盘
    this.mapping(this.context);
    //用户类型 0 = 人； 1 = 计算机
    this.type = '0';
    //游戏结束判断
    this.over = false;
    //棋子落子位置
    this.recordChessmanInfo = [];
    this.recordChessmanInit();
    //统计赢法
    this.peopleStatistic = [];
    this.AIStatistic = [];
    //赢法计数
    this.count = 0;
    //赢法数组
    this.wins = [];
    this.winsInit();
}
//初始化棋子位置信息
Gobang.prototype.recordChessmanInit = function(){
   for(var i = 0; i < this.settings.gap; i++){
       this.recordChessmanInfo[i] = [];
       for(var j=0; j< this.settings.gap; j++) {
           this.recordChessmanInfo[i][j] = 0;
       }
   }
}
//赢法数组初始化
Gobang.prototype.winsInit = function(){
    for(var i=0; i < this.settings.gap; i++){
        this.wins[i] = [];
        for(var j=0; j < this.settings.gap; j++){
            this.wins[i][j] = [];
        }
    }
    //横向
    for(var i=0; i < this.settings.gap; i++){
        for(var j=0; j < this.settings.gap - 4; j++){
            for(var k=0; k < 5; k++){
                this.wins[i][j+k][this.count] = true;
            }
            this.count++;
        }
    }
    //纵向
    for(var i=0; i < this.settings.gap; i++){
        for(var j=0; j < this.settings.gap - 4; j++){
            for(var k=0; k < 5; k++){
                this.wins[j+k][i][this.count] = true;
            }
            this.count++;
        }
    }
    //正斜线
    for(var i=0; i < this.settings.gap-4; i++){
        for(var j=0; j < this.settings.gap - 4; j++){
            for(var k=0; k < 5; k++){
                this.wins[i+k][j+k][this.count] = true;
            }
            this.count++;
        }
    }
    //反斜线
    for(var i=0; i < this.settings.gap-4; i++){
        for(var j=this.settings.gap-1; j >3; j--){
            for(var k=0; k < 5; k++){
                this.wins[i+k][j-k][this.count] = true;
            }
            this.count++;
        }
    }
    for(var i=0; i< this.count; i++){
        this.peopleStatistic[i] = 0;
        this.AIStatistic[i] = 0;
    }
    console.log(this.count)
    this.bindEvent(this.context);
}
//对象拷贝
Gobang.prototype.extend = function(target, options){
    for(var name in options){
        target[name] = options[name];
    }
    return target;
}
//绘制棋盘
Gobang.prototype.mapping = function(obj){
    var space = parseInt(this.cnavas.width/this.settings.gap);
    if(space < 30){
        throw '棋子之间距离太小，请减少棋盘大小';
    }
    var start = (this.cnavas.width - space * (this.settings.gap-1))/2;
    var end = this.cnavas.width - start;
    obj.strokeStyle = "#bfbfbf";
    for(var i=0; i<this.settings.gap; i++){
        obj.moveTo(start + i*space,start);
        obj.lineTo(start + i*space,end);
        obj.stroke();
        obj.moveTo(start , start + i*space);
        obj.lineTo(end , start + i*space);
        obj.stroke();
    }
}
//一个棋子
Gobang.prototype.chessman = function(obj,i,j){
    var space = parseInt(this.cnavas.width/this.settings.gap);
    var start = (this.cnavas.width - space * (this.settings.gap-1))/2;
    var size = start > 15 || start < 18 ? 15 : start
    var gradient = obj.createRadialGradient(start + i*space +2,start+ j*space-2,size-3,start + i*space +2,start+ j*space-2,0);
    switch (this.type){
        case '0' :
            gradient.addColorStop(0,'#0a0a0a');
            gradient.addColorStop(1,'#636363');
            break;
        case '1' :
            gradient.addColorStop(0,'#d1d1d1');
            gradient.addColorStop(1,'#f9f9f9');
            break;
    }
    obj.beginPath();
    obj.arc(start + i*space ,start+ j*space,size-3, 0,2*Math.PI);
    obj.closePath();
    obj.fillStyle = gradient;
    obj.fill()
}
//绑定事件
Gobang.prototype.bindEvent = function(obj){
    var _this = this;
    var space = parseInt(this.settings.width/this.settings.gap);
    console.log(_this.count)
    this.cnavas.addEventListener('click',function(event){
        if(_this.over){
            return;
        }
        var x = event.offsetX;
        var y = event.offsetY;
        var i = Math.floor(x/space);
        var j = Math.floor(y/space);
        if(_this.recordChessmanInfo[i][j] === 0){
            _this.chessman(obj,i,j);
            _this.recordChessmanInfo[i][j] = 1;
            for(var k=0;k<_this.count;k++){
                if(_this.wins[i][j][k]){
                    _this.peopleStatistic[k]++;
                    _this.AIStatistic[k] = -1;
                    if(_this.peopleStatistic[k] == 5){
                        _this.over = true;
                        return _this.gameOver(_this.type);
                    }
                }
            }
        }
        if(!_this.over){
            _this.type = '1';
            _this.computeAI();
        }
    },false)
}
//ai策略
Gobang.prototype.computeAI= function(){
    //记录得分数组
    var peopleScore = [];
    var AIScore = [];
    //最高分数
    var maxScore = 0;
    var m = 0,n = 0;
    //记录得分初始化
    for(var i=0; i<this.settings.gap; i++){
        peopleScore[i] = [];
        AIScore[i] = [];
        for(var j=0; j<this.settings.gap; j++){
            peopleScore[i][j] = 0;
            AIScore[i][j] = 0;
        }
    }
    for(var i=0; i<this.settings.gap; i++){
        for(var j=0; j<this.settings.gap; j++){
            if(this.recordChessmanInfo[i][j] === 0){
                for(var k=0; k<this.count;k++){
                    if(this.wins[i][j][k]){
                        switch (this.peopleStatistic[k]){
                            case 1:
                                peopleScore[i][j] += 200;
                                break;
                            case 2:
                                peopleScore[i][j] += 400;
                                break;
                            case 3:
                                peopleScore[i][j] += 2000;
                                break;
                            case 4:
                                peopleScore[i][j] += 1000;
                                break;
                        }
                        switch (this.AIStatistic[k]){
                            case 1:
                                AIScore[i][j] += 250;
                                break;
                            case 2:
                                AIScore[i][j] += 450;
                                break;
                            case 3:
                                AIScore[i][j] += 2200;
                                break;
                            case 4:
                                AIScore[i][j] += 2000;
                                break;
                        }
                        if(peopleScore[i][j] > maxScore){
                            maxScore = peopleScore[i][j];
                            m = i;
                            n = j;
                        }else if(peopleScore[i][j] == maxScore){
                            if(peopleScore[i][j] > peopleScore[m][n]){
                                m = i;
                                n = j;
                            }
                        }
                        if(AIScore[i][j] > maxScore){
                            maxScore = AIScore[i][j];
                            m = i;
                            n = j;
                        }else if(AIScore[i][j] == maxScore){
                            if(AIScore[i][j] > AIScore[m][n]){
                                m = i;
                                n = j;
                            }
                        }
                    }
                }
            }
        }
    }
    console.log(this.type)
    this.chessman(this.context,m,n);
    this.recordChessmanInfo[m][n] = 2;
    for(var k=0;k<this.count;k++){
        if(this.wins[m][n][k]){
            this.AIStatistic[k]++;
            this.peopleStatistic[k] = -1;
            if(this.AIStatistic[k] == 5){
                this.over = true;
                return this.gameOver(this.type);
            }
        }
    }
    if(!this.over){
        this.type = '0';
    }
}
//游戏结束
Gobang.prototype.gameOver = function(status){
    return status ? this.peopleWin() : this.AIWin();
}
//游戏玩家胜利
Gobang.prototype.peopleWin = function(){
    return alert('你是一个1b，既然连电脑都赢了')
}
//游戏计算机胜利
Gobang.prototype.AIWin = function(){
    return alert('你是一个2b，既然连电脑都赢不了')
}
//游戏玩家失败
Gobang.prototype.peoplefail = function(){

}
//游戏计算机失败
Gobang.prototype.AIFail = function(){

}