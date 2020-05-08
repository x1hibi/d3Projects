//This function is to styling the console.log and optimize the debug process
function debugLog(label,message){
    let Label=label[0].toUpperCase() + label.slice(1)
    return  typeof(message)=="string" ? console.log(`%c ${Label}: %c${message}`,"color:yellow","color:cyan") : console.log(`%c ${Label}:`,"color:blue",message)
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
    


    
    let minValueY=d3.min(chartData,d=>d[1])
    let maxValueY=d3.max(chartData,d=>d[1])
    const yScale=d3.scaleLinear().domain([0,maxValueY]).range([height-padding,padding])
    const yAxis=d3.axisLeft(yScale)

    let minValueX=d3.min(chartData,d=>parseInt(d[0].slice(0,4)))
    let maxValueX=d3.max(chartData,d=>parseInt(d[0].slice(0,4)))
    const xScale=d3.scaleLinear().domain([minValueX,maxValueX]).range([50,width])
    const xAxis=d3.axisBottom(xScale)
    debugLog("maxy",height-yScale(maxValueY))
    debugLog("miny",height-yScale(minValueY))
    debugLog("lengthbyp2px",size*2)

    //We created a svg into the chart container, this is 100% of 100% of the cureent cmtainer 
    const svg=d3.select("#title").append("svg").attr("width",width+25).attr("height",height)

    svg.append("g").attr("transform","translate("+(50)+",0)").attr("id","y-axis").call(yAxis)
    svg.append("g").attr("transform","translate(0,"+(height-padding)+")").attr("id","x-axis").call(xAxis)
    svg.selectAll("rect").data(chartData).enter().append("rect").attr("width",((width-50)/size)-1).attr("height",d=>height-yScale(d[1])-padding).attr("x",(d,i)=>50+i*(width-50)/size).attr("y",d=>yScale(d[1])).attr("class","bar")
} 

