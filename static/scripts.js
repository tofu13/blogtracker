console.log("loaded");

function editorSetting(selector) {
    return {
        selector: selector,
        inline: false,
        menubar: true,
        setup: function (editor) {
            editor.on('change', function (e) {
                save(e);
            });
        },
        plugins : 'autoresize'
    };
}

async function save(evt) {
    var tracknumber = evt.target.getElement().parentElement.getAttribute('tracknumber');
    await fetch('/tracks/' + tracknumber, {
        method: 'PUT',
        body: JSON.stringify({
        "text": evt.target.getContent(),
        "date": document.getElementById("date-" + tracknumber).value
        })
    })
}

function switchtab(evt) {
    var x = document.getElementsByClassName("tab");
    var i;
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
        }
    document.getElementById(this.href.split("#")[1]).style.display = "block";
}

function setupMenu(){
    var x = document.getElementsByClassName("nav");
    var i;
    for (i = 0; i < x.length; i++) {
      x[i].addEventListener('click', switchtab);
    }
}

function removeOptions(selectElement) {
   var i, L = selectElement.options.length - 1;
   for(i = L; i >= 0; i--) {
      selectElement.remove(i);
   }
}

function populateTopics(topics) {
    var selectElement = document.getElementById("story.select");
    removeOptions(selectElement);

    var opt = document.createElement("option");
    opt.value= "null";
    opt.innerHTML = "Choose topic";
    opt.style = "display:none";
    selectElement.appendChild(opt);

    var opt = document.createElement("option");
    opt.value= "null";
    opt.innerHTML = "* Create new topic *";
    opt.style = "font-style: italic"
    selectElement.appendChild(opt);

    for(var element of topics)
        {
           var opt = document.createElement("option");
           opt.value= element;
           opt.innerHTML = element; // whatever property it has

           // then append it to the select element
           selectElement.appendChild(opt);
        }
}

async function setupTopics() {
    var response = await fetch('/topics');
    populateTopics(await response.json());
}

async function loadStory(evt) {
    response = await fetch('/tracks?topic='+document.getElementById("story.select").value)
    var container = document.getElementById("story.container");
    while(container.firstChild) {
        container.removeChild(container.firstChild);
    }
    for(var record of await response.json()) {
        var track = document.createElement("div")
        track.setAttribute("tracknumber", record[0]);
        track.setAttribute("class", "track");

        var date = document.createElement("input");
        date.setAttribute("type","date");
        date.setAttribute("id", "date-"+record[0]);
        date.readOnly = true;
        date.value = record[1]

        var paragraph = document.createElement("textaera");
        paragraph.setAttribute("id", "content-"+record[0]);
        paragraph.setAttribute("class", "editable");

        paragraph.innerHTML = record[2];

        track.appendChild(date);
        track.appendChild(paragraph);

        container.appendChild(track);
        track.addEventListener('click', function (k){
            openEditor(k.currentTarget.getAttribute("tracknumber"));
            })
    };
    closeNewTopicForm();
}

function loadStoryEvent(evt){
    console.log(evt);
    if (evt.target.value == "null"){
        document.getElementById("newTopic").style.display="block";
    }
    else {
        loadStory(evt);
    }
}

function openEditor(tracknumber) {
    closeEditor()
    document.getElementById("date-"+tracknumber).readOnly = false;
    tinymce.init(editorSetting("#content-"+tracknumber));
}

function closeEditor() {
    if (tinymce.activeEditor) {
        tinymce.activeEditor.destroy();
        }
}

async function newTrack() {
    response = await fetch('/tracks/', {
        method: 'POST',
        body: JSON.stringify({"topic": document.getElementById("story.select").value})
        })

    var tracknumber = await response.json();
    await loadStory();
    console.log(tracknumber);
    openEditor(tracknumber);
}

async function createNewTopic(evt) {
    var topicName = document.getElementById("newTopicName").value;
    if (topicName != ""){
    response = await fetch('/topics/', {
        method: 'POST',
        body: JSON.stringify(topicName)
        })
    }
    closeNewTopicForm();
    document.getElementById("newTopicName").value = "";
    await setupTopics();
    document.getElementById("story.select").value = topicName;
    await newTrack();
}

function closeNewTopicForm() {
    document.getElementById("newTopic").style.display = "none";
}

console.log("init");
window.editor = null;

setupMenu();
setupTopics();

document.getElementById("main.form").addEventListener('submit', save);
document.getElementById("story.select").addEventListener('change', loadStoryEvent);
document.getElementById("newtrack").addEventListener('click', newTrack);
document.getElementById("newTopic").addEventListener('submit', createNewTopic);
