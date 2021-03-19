var queueIndex = new Array();
var subQueue = new Array();
var queueEntryId = 0;
var queueContainer = document.getElementById("queue");
var mosasaYTPlayer;

/*************CLASS QUEUEENTRY*****************************************************************************/
class queueEntry {
	constructor(logLineObject) {
		this.lineData = logLineObject;
		queueIndex.push(this);
		this.createEntry();
	}

	createEntry() {
		this.createEntryDiv()
		this.populateEntryDiv()
		this.addLogButtons()
	}

	createEntryDiv() {
		queueEntryId += 1
		this.entryDiv = document.createElement("div")
		this.entryDivId = "entry-" + queueEntryId
		this.entryDiv.setAttribute("id",this.entryDivId)
		this.entryDiv.setAttribute("class","entry-div")
		queueContainer.appendChild(this.entryDiv)
	}

	populateEntryDiv() {
		this.entryTitle = document.createElement("a")
		this.entryTitle.setAttribute("class","entry-title")
		this.entryTitle.setAttribute("href","https://www.youtube.com/watch/" + this.lineData.url);
		this.entryTitle.setAttribute("target","_blank");
		var entryTitleText = document.createTextNode(this.lineData.title)
		this.entryTitle.appendChild(entryTitleText)
		this.entryDiv.appendChild(this.entryTitle)
	}

	addLogButtons() {
		this.buttonDiv = document.createElement("div");
		this.buttonDiv.setAttribute("class","entry-btn-div");
		this.buttonDiv.setAttribute("id",this.entryDivId + "btn-div");
		this.entryDiv.appendChild(this.buttonDiv);
		this.addPlayButton();
		//this.addOrderButtons();
		this.addSubQueueButtons();
		this.addDeleteFromQueueButtons();
	}

	addPlayButton() {
		this.playButton = document.createElement("button");
		this.playButton.setAttribute("type","button");
		this.playButton.setAttribute("class","entry-btn");
		this.playButton.setAttribute("id", this.entryDivId + "-play-btn");
		this.playButton.setAttribute("onclick","playEntry(\"" + this.entryDivId + "\")"); //this one will be tricky to figure out I think.
		this.playButton.appendChild(document.createTextNode("Play"));
		this.buttonDiv.appendChild(this.playButton);
	}

	addOrderButtons() {
		this.orderUpButton = document.createElement("button");
		this.orderUpButton.setAttribute("type","button");
		this.orderUpButton.setAttribute("class","entry-btn");
		this.orderUpButton.setAttribute("id", this.entryDivId + "-order-up-btn");
		this.orderUpButton.setAttribute("onclick","moveEntry(\"" + this.entryDivId + "\",\"up\",1)");
		this.orderUpButton.appendChild(document.createTextNode("Move up"));
		this.buttonDiv.appendChild(this.orderUpButton);

		this.orderDownButton = document.createElement("button");
		this.orderDownButton.setAttribute("type","button");
		this.orderDownButton.setAttribute("class","entry-btn");
		this.orderDownButton.setAttribute("id", this.entryDivId + "-order-down-btn");
		this.orderDownButton.setAttribute("onclick","moveEntry(\"" + this.entryDivId + "\",\"down\",1)");
		this.orderDownButton.appendChild(document.createTextNode("Move down"));
		this.buttonDiv.appendChild(this.orderDownButton);
	}

	addSubQueueButtons() {
		this.subQueueButton = document.createElement("button");
		this.subQueueButton.setAttribute("type","button");
		this.subQueueButton.setAttribute("class","entry-btn");
		this.subQueueButton.setAttribute("id", this.entryDivId + "-add-sub-queue-btn");
		this.subQueueButton.setAttribute("onclick","addEntryToSubQueue(\"" + this.entryDivId + "\")");
		this.subQueueButton.appendChild(document.createTextNode("Add to queue"));
		this.buttonDiv.appendChild(this.subQueueButton);
	}

	modifyQueueButtons(addRemove) {
		switch (addRemove) {
			case "add":
				this.setQueueButtonsAdded();
				break;
			case "remove":
				this.reInitQueueButtons();
				break;
		}
	}

	reInitQueueButtons() {
		this.subQueueButton.setAttribute("onclick","addEntryToSubQueue(\"" + this.entryDivId + "\")");
		document.getElementById(this.entryDivId + "-add-sub-queue-btn").innerHTML = "Add to queue";
	}

	setQueueButtonsAdded() {
		this.subQueueButton.setAttribute("onclick","removeEntryFromSubQueue(\"" + this.entryDivId + "\")");
		document.getElementById(this.entryDivId + "-add-sub-queue-btn").innerHTML = "(" + this.getSubQueuePos() + ")";
	}

	addDeleteFromQueueButtons() {
		this.deleteEntryButton = document.createElement("button");
		this.deleteEntryButton.setAttribute("type","button");
		this.deleteEntryButton.setAttribute("class","entry-btn");
		this.deleteEntryButton.setAttribute("id", this.entryDivId + "-remove-entry-btn");
		this.deleteEntryButton.setAttribute("onclick","getEntryById(\"" + this.entryDivId + "\").removeFromQueue()");
		//this.deleteEntryButton.setAttribute("style" , "position: relative; left: 240px;");
		this.deleteEntryButton.appendChild(document.createTextNode("Remove"));
		this.buttonDiv.appendChild(this.deleteEntryButton);
	}

	replacePlayerSrc() {
		mosasaYTPlayer.loadVideoById(this.lineData.url);
	}

	removeFromQueue() {
		var pos = this.getQueueIndexPos();
		queueIndex.splice(pos,1);
		queueContainer.removeChild(this.entryDiv);
	}

	addToQueue() {
		queueIndex.push(this);
		queueContainer.appendChild(this.entryDiv);
	}

	shiftInQueue(index) {
		var previousPos = this.getQueueIndexPos();
		if (index < previousPos) {previousPos += 1;}
		queueIndex.splice(index,0,this);
		if (index >= queueIndex.length-1) {
			queueContainer.appendChild(this.entryDiv);
		}
		else {
		var beforeDiv = queueIndex[index + 1].entryDiv;
		queueContainer.insertBefore(this.entryDiv,beforeDiv);
		}
		queueIndex.splice(previousPos,1);
	}

	getQueueIndexPos() {
		return queueIndex.indexOf(this);
	}

	getSubQueuePos() {
		return subQueue.indexOf(this);
	}
}
/*************CLASS QUEUEENTRY*****************************************************************************/

/*************CLASS LOGLINE********************************************************************************/
class logLine {
	constructor(logLine) { //don't need to push to global index since an entry is made right after this object is made.
		this.line = logLine;
		this.getIndeces();
		this.getTitle();
		this.getURL();
	}

	getIndeces() {
		this.titleEndPos = this.line.indexOf("\thttps://www.youtube.com/watch")-1;
		this.youtubeSubURLStartPos = this.line.indexOf("https://www.youtube.com/watch/") + "https://www.youtube.com/watch/".length;
		this.youtubeSubURLEndPos = this.line.indexOf("\n<br>",this.youtubeSubURLStartPos);
	}

	getTitle() {
		this.title = this.line.slice(0,this.titleEndPos+1);
	}

	getURL() {
		this.url = this.line.slice(this.youtubeSubURLStartPos); //will have to add handling for urls of other types later, probably will be easier to implement on the server side
	}
}
/*************CLASS LOGLINE********************************************************************************/

/*********************************************************************************************************/
/*************FUNCTIONS***********************************************************************************/
/*********************************************************************************************************/
function encodeSubQueueToURL() {
	//I'm not sure how I'm going to do this but I know I want to
	//I can think of a simple, dumb way anyways	//here goes:
	var playListArray = new Array();
	for (let entry of subQueue) {
		playListArray.push(entry.entryDivId);
	}
	var playListURI = encodeURIComponent(playListArray.join("_"));
	location.hash = playListURI;
}

function decodeSubQueueFromURL() {
	var playListURIEncoded = location.hash.slice(1); //gets the hashstring and removes "#" //hopefully
	var playListURI = decodeURIComponent(playListURIEncoded);
	var playListArray = playListURI.split("_"); //don't know if I should declare new Array(); before assigning this oh well.
	for (let entryDivId of playListArray) {
	  addEntryToSubQueue(entryDivId);
	}
	autoPlayNextEntry(); //we'll see how this works out here.
}

function makeRandomSubQueue10() {
	var queueLength = getQueueLength();
	for (i=1; i<=10; i++) {
	var entryIdNumber = Math.floor(Math.random() * queueLength);
	var entryDivId = "entry-" + entryIdNumber; //hopefully this works
	addEntryToSubQueue(entryDivId);
	}
}

function addEntryToSubQueue(entryDivId) { //really don't like the fact that some functions call the div id and some call the object, I know there's a better way to keep things uniform.
	var entry = getEntryById(entryDivId);
	subQueue.push(entry);
	addEntryToSubQueueDiv(entry);
	entry.modifyQueueButtons("add");
}

function addEntryToSubQueueDiv(entry) {
	entry.subQueueDivButton = document.createElement("button");
	entry.subQueueDivButton.setAttribute("type","button");
	entry.subQueueDivButton.setAttribute("id",entry.entryDivId + "-subQueue-div-btn");
	entry.subQueueDivButton.setAttribute("class","entry-btn");
	entry.subQueueDivButton.setAttribute("onclick","removeEntryFromSubQueue(\"" + entry.entryDivId + "\")");
	entry.subQueueDivButton.appendChild(document.createTextNode(entry.lineData.title));
	var subQueueDiv = document.getElementById("subQueue-div");
	subQueueDiv.appendChild(entry.subQueueDivButton);
}

function removeEntryFromSubQueue(entryDivId) {
	var entry = getEntryById(entryDivId);
	subQueue.splice(entry.getSubQueuePos(),1);
	removeEntryFromSubQueueDiv(entry);
	entry.modifyQueueButtons("remove");
	for (let entry of subQueue) {
		document.getElementById(entry.entryDivId + "-add-sub-queue-btn").innerHTML = "(" + entry.getSubQueuePos() + ")";
	}
}

function removeEntryFromSubQueueDiv(entry) {
	//removeEntryFromSubQueue(entry.entryDivId);
	document.getElementById(entry.entryDivId + "-subQueue-div-btn").remove();
}

function getQueueLength() {
	var queueLength = document.getElementById("log_length").innerHTML;
	return queueLength;
}

function shuffleQueue() {
	var queueLength = queueIndex.length;
	for (i = 0; i <= 3; i++) {
		for (index = 0; index < queueLength; index++) {
			var randomPos = Math.floor(Math.random() * queueLength);
			queueIndex[index].shiftInQueue(randomPos);
		}
	}
	autoPlayNextEntry();
}

function moveEntry(entryDivId,direction,number) { //need to add validation so that it checks direction to be either "up" or "down", though this isn't a  big deal
	var moveMod = 0;
	if (direction == "up") {number *= -1;}
	else if (direction == "down") {moveMod = 1;}
	var entry = getEntryById(entryDivId);
	var isEndEntry = isEndEntryById(entryDivId);
	if (isEndEntry == 1 && number < 0) {number = 0;}
	else if (isEndEntry == -1 && number > 0) {number = 0;}
	var queueStartPos = entry.getQueueIndexPos();
	number = moveDistanceInBounds(queueStartPos,number);
	var queueDestinationPos = queueStartPos + number + moveMod;
	entry.shiftInQueue(queueDestinationPos);
}

function moveDistanceInBounds(currentPos,number) {
	//make sure number is less than or equal to the bounds of the queue
	if (currentPos + number < 0) {number = -1 * currentPos;}
	else if (currentPos + number > queueIndex.length) {number = queueIndex.length - currentPos;}
	return number;
}

function autoPlayNextEntry() {
	if (subQueue.length != 0) {
		playEntry(subQueue[0].entryDivId);
		removeEntryFromSubQueue(subQueue[0].entryDivId);
	}
	else {
		playEntry(getEndEntryId("top"));
	}
}

function playEntry(entryDivId) {
	var entry = getEntryById(entryDivId);
	entry.removeFromQueue();
	entry.addToQueue();
	entry.replacePlayerSrc();
}

function isEndEntryById(entryId) {
	var topId;
	topId = getEndEntryId("top");
	var bottomId;
	botomId = getEndEntryId("bottom");

	if (entryId == topId) {
		return 1;
	}
	else if (entryId == bottomId) {
		return -1;
	}
	else {
		return 0;
	}
}

function getEndEntryId(whichEnd) {
	var endIndex;
	var queueEntryNodeList = document.querySelectorAll("#queue div.entry-div");
	switch (whichEnd) {
		case "top":
			endIndex = 0;
			break;
		case "bottom":
			endIndex = queueEntryNodeList.length - 1;
			break;
		default:
			endIndex = 0;
	}

	//var endEntry = document.querySelectorAll("#queue div.entry-div")[endIndex];
	var endEntry = queueEntryNodeList[endIndex];
	var endEntryId = endEntry.getAttribute("id");
	//var endEntryId = document.querySelectorAll("#queue div.entry-div")[endIndex].getAttribute("id");
	return endEntryId
}

function getEntryById(id) { //this function is really stupid and it's mega dumb how much the script relies on it.
	for (let entry of queueIndex) {
		if (id == entry.entryDivId) {
			return entry;
		}
		else {
			continue;
		}
	}
	return 0
}

function getLog() {
	var log = document.getElementById("log").innerHTML;
	var _Line_Pos = 0;
	var _Line_EndPos;
	var next_Line_Pos = 0;
	var _Line_String;
	var logEntryText;
	var length = getQueueLength();
	for (index = 0; index <= length; index++) {
		_Line_Pos = log.indexOf("_LINE_",next_Line_Pos);
		_Line_String = "_LINE_" + index;
		_Line_Pos = _Line_Pos + _Line_String.length;
		next_Line_Pos = log.indexOf("_LINE_",_Line_Pos);
		_Line_EndPos = next_Line_Pos - "\n<br>".length;
		logEntryText = log.slice(_Line_Pos,_Line_EndPos);
		let logLineObject = new logLine(logEntryText);
		let playlistQueueEntry = new queueEntry(logLineObject);
	}
}

/*****************************YOUTUBE API*****************************************************************************************************/
function loadYoutubeIframeAPIScript() {
	var tag = document.createElement('script');

	tag.src = "https://www.youtube.com/iframe_api";
      	var firstScriptTag = document.getElementsByTagName('script')[0];
      	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
	document.getElementById("queue-test-text").innerHTML = "youtubeAPI ready";
	mosasaYTPlayer = new YT.Player('player', {
		height: '200',
		width: '200',
		videoId: 'FcZOnrL9VKM',
		playerVars: {
			'autoplay': 1,
			'disablekb': 1,
			'origin': 'https://holedigging.club',
			'enablejsapi': 1
			},
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
			}
		});
	document.getElementById("queue-test-text").innerHTML = "mosasaYTPlayer object created";
}

function onPlayerReady(event) {
	document.getElementById("queue-test-text").innerHTML = "onPlayerReady";
	shuffleQueue();
	//event.target.playVideo();
}

function onPlayerStateChange(event) {
	document.getElementById("queue-test-text").innerHTML = "onPlayerStateChange";
	if (event.data == YT.PlayerState.ENDED) {
		autoPlayNextEntry();
	}
}

function stopVideo() {
	mosasaYTPlayer.stopVideo();
}
/*****************************YOUTUBE API*****************************************************************************************************/

/*****************************EXECUTION BLOCK AND TEST FUNCTIONS*****************************************************************************/
function main() {
	loadYoutubeIframeAPIScript();
	getLog();
}

function button_test() {
	document.getElementById("queue-test-text").innerHTML = "queueLength is " + getQueueLength();
	autoPlayNextEntry();
}

main()
