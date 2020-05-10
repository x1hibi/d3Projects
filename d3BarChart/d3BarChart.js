//This function is to styling the console.log and optimize the debug process
function debugLog(label,message){
    let Label=label[0].toUpperCase() + label.slice(1)
    return  typeof(message)=="string" ? console.log(`%c ${Label}: %c${message}`,"color:yellow","color:cyan") : console.log(`%c ${Label}:`,"color:white",message)
}

let url="https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"

//This fuction make a AJAX petition and is handle the result by the callback function
function makeRequest(type,url,callback,nameFile='data.json'){
    const http=new XMLHttpRequest();
    debugLog("Status","the petiton was created")
    http.onreadystatechange=function(){
        if(this.readyState==4 && this.status==200){
            let jsonData=JSON.parse(this.response)
            debugLog("Status","the petition is ready")
            callback(jsonData)
        }else if(this.readyState==4 && this.status==0){
            debugLog("Status","network not avalible")
            fetch(nameFile).then(response=>{console.log(response) ; return response.json()} ).then(jsonResponse=>callback(jsonResponse))
        }else{
            debugLog("Status","the petition is not ready")
        }
    }
    http.open(type,url,true);
    http.send()
    debugLog('Status',"the petition has sended")
}   


//Start the petition when the hmtl is load
window.addEventListener('load',makeRequest("GET",url,handleData))



//this function handle the behabior of the page when get the data from the petition
function handleData(data){
    debugLog("handleData","enter to the funtion")
    let chartData=data.data
    debugLog("data",chartData)
    debugLog("step 1","start build a barchart!")

    let size=chartData.length
    

    let height=500
    let width=1000

    //we create a scale to the values bigger than the svg size
    let padding = 25
    let leftPadding= 60

        let minValueY=d3.min(chartData,d=>d[1])
        let maxValueY=d3.max(chartData,d=>d[1])
        const yScale=d3.scaleLinear().domain([0,maxValueY]).range([height-padding,padding])
        const yAxis=d3.axisLeft(yScale)

        let minValueX=d3.min(chartData,d=>d[0])
        let maxValueX=d3.max(chartData,d=>d[0])
    

       const svg=d3.select("#title").append("svg").attr("width",width+25).attr("height",height)
       let timeScale = d3.scaleTime()
       .domain([new Date(minValueX), new Date(maxValueX)])
         .range([0, width-50]);
         var xAxis=d3.axisBottom(timeScale)


    debugLog("scale",timeScale) 

    //we add axes titles and title graf 
    svg.append("text").attr("x",width/2).attr("y",padding).text("Gross Domestic Product Growing").attr("text-anchor","middle").attr("class","title")
    svg.append("text").attr("x",width/2).attr("y",height-padding/2).text("Date (Year)").attr("text-anchor","middle").attr("class","axisLabel")
    svg.append("text").attr("x",(-height/2)+padding).attr("y",15).text("Gross Domestic Product (Billion USD)").attr("text-anchor","middle").attr("transform","rotate(-90)").attr("class","axisLabel")


    svg.append("div").attr("id","tooltip")
    svg.append("g").attr("id","y-axis").attr("transform","translate("+leftPadding+","+(-padding+5)+")").call(yAxis)
    svg.append('g').attr("id","x-axis").attr("transform","translate("+(leftPadding)+","+(height-padding*2+5)+")").call(xAxis)
    let bars=svg.selectAll("rect").data(chartData).enter().append("rect").attr("width",(width-50)/size).attr("height",d=>height-yScale(d[1])-padding).attr("x",(d,i)=>leftPadding+i*(width-50)/size).attr("y",d=>yScale(d[1])-padding+5).attr("class","bar").attr("fill",(d,i)=>"rgb(95,25,"+(255-i)+")").attr("data-date",d=>d[0]).attr("data-gdp",d=>d[1])
    bars.on("mouseover",d=>{
        let tooltip=document.getElementById("tooltip")
        tooltip.style.opacity=1
        tooltip.innerHTML=`Current data <br/>${d[1]} Billion USD <br/> ${d[0]}`;
        tooltip.setAttribute("data-date",d[0])
        tooltip.style.left=event.clientX+25
        tooltip.style.top=event.clientY-75
        debugLog("x",event.clientX);
        debugLog("Y",event.clientY)
    }).on("mouseout",d=>{
        let tooltip=document.getElementById("tooltip")
        tooltip.style.opacity=0
    })
    

}