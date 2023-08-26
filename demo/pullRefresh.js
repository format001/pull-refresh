
class PullRefresh {
    constructor(option) {
        this.option = option;
        this.OPullContainer = this.option.pullContainer;
        this.MaxLoadingHeight = this.option.MaxLoadingHeight;
        this.transition = this.option.transition;
        this.loadingBeforeFn = this.option.loadingBefore
        this.prepareLoadingFn = this.option.prepareLoading;
        this.transition = this.option.transition;

        this.flag = false;
        this.moveCount = 1/4; //阻力系数

        this.init();
    }

    init () {
        this.bindEvent();
    }

    bindEvent () {
        addEvent(this.OPullContainer, 'touchstart', this.touchstartHandle.bind(this));
        addEvent(this.OPullContainer, 'touchmove', this.touchmoveHandle.bind(this));
        addEvent(this.OPullContainer, 'touchend', this.touchendHandle.bind(this));
    }

    touchstartHandle (e) {
        this.startY = e.touches[0].clientY;
        this.startScrollTop = window.pageYOffset ? window.pageYOffset
                                : (document.body.offsetTop ? document.body.offsetTop : document.documentElement.offsetTop);
    }

    touchmoveHandle (e) {
        this.flag = true;
        // 下拉是正数， 上拉是负数
        this.moveY = e.touches[0].clientY - this.startY;
        /*
        * 下拉距离
        * */
        this.translateY = (this.moveY - this.startScrollTop) * this.moveCount;
        if (this.moveY - this.startScrollTop >= 0) {
            this.OPullContainer.style.transform = 'translateY('+ this.translateY +'px)';
            this.OPullContainer.style.transition = '';

            //下拉距离小于及大于临界值执行的dom操作
            this.loadingBeforeFn(this.translateY);
            this.prepareLoadingFn(this.translateY);
        }
    }

    async touchendHandle (e) {
        if(this.translateY > this.MaxLoadingHeight && this.flag){
            this.flag = false;
            //回弹动画
            this.transition0(this.MaxLoadingHeight)
            //刷新操作
            this.option.loading();
            //数据请求
            await this.option.ajax();
            //刷新成功及回弹动画加入异步队列，保证在数据请求之后执行
            var timer1 = setTimeout(() => {
                this.option.loaded();
                var	timer2 = setTimeout(() => {
                    this.transition0(0)
                }, 300)
            }, 700)
        } else {
            this.transition0(0)
        }
    }

    transition0 (num) {
        this.OPullContainer.style.transform = 'translateY('+ num +'px)';
        this.OPullContainer.style.transition = 'all ' + this.transition;
    }
}



function addEvent(el, type, fn) {
    if(window.addEventListener) {
        el.addEventListener(type, fn, false);
    } else if(el.attachEvent) {
        el.attachEvent('on' + type, fn);
    } else {
        el['on' + type] = fn;
    }
}
