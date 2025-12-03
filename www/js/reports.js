class reportManager{
    constructor(){
        this.list = [];
        this.UI = new reportUI();
    }

    init(){
        fetch("https://rfeqserver.myqnapcloud.com/report?len=20")
        .then(res => res.json())
        .then(msgs => {
            this.list = [];
            for(const msg of msgs){
                this.list.push(new report(msg))
            }
            this.UI.update(this.list);
        })
        .catch(err => {
            console.log(err);
            alert(err);
        })
        
    }

    addReport(msg){
        this.list.push(new report(msg));
        if(this.list.length >= 30){
            this.removeEarliestReport();
        }
        this.UI.update(list);
    }

    removeEarliestReport(){
        this.list.shift();
    }
}

class report{
    constructor(msg){
        this.id = msg.id;
        this.maxShindo = msg.max_shindo;
        this.epicenter = msg.epicenter;
        this.datetime = msg.datetime;
        this.magnitude = msg.magnitude;
        this.depth = msg.depth;
    }
}

class reportUI{
    constructor(){
        this.dom = document.getElementById("reports")
    }

    update(list){
        this.dom.innerHTML = "";
        for(let report of list){
            let container = document.createElement("div");
            container.className = "eew_tile";
            container.innerHTML = `
                <div class="report_content">
                    <div class="report_maxShindo">
                        <!--<h3 align="center" style="margin: 0;">最大震度</h3>-->
                        <img src="img/shindo/${report.maxShindo}.png" style="width:100%;">
                    </div>
                    <div class="report_details">
                        <h2 style="margin-bottom: 0;">${report.epicenter}</h2>
                        <p>${report.datetime}</p>
                    </div>
                    <div class="report_scale">
                        <h1 style="text-align: center;justify-content: center;">${report.magnitude}</h1>
                    </div>
                                    
                </div>
            `
            this.dom.appendChild(container);
        }
    }
}

export {reportManager}