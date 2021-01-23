console.log("loaded");

function editorSetting(selector) {
    return {
        selector: selector,
        inline: false,
        menubar: true,
        setup: function (editor) {
            //editor.on('init', function(e) {
            //    e.target.hide();
            //});
            editor.on('change', function (e) {
                save(e);
            });
        },
        plugins : 'autoresize'
    };
}

function save(evt) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        // On succesful save
        }
    };
    var tracknumber = evt.target.getElement().parentElement.getAttribute('tracknumber');
    xhr.open('PUT', '/tracks/' + tracknumber);
    xhr.send(JSON.stringify({
        "text": evt.target.getContent(),
        "date": document.getElementById("date-" + tracknumber).value
        }));
    evt.preventDefault();
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
    for(var element of topics)
        {
           var opt = document.createElement("option");
           opt.value= element;
           opt.innerHTML = element; // whatever property it has

           // then append it to the select element
           selectElement.appendChild(opt);
        }
}

function setupTopics() {
    fetch('/topics').then(
        response => response.json()
        ).then(
        json => populateTopics(json)
        )
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
    console.log("finish load story");
}

function loadStoryEvent(evt){
    console.log(evt);
    loadStory(evt);
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

console.log("init");
window.editor = null;

setupMenu();
setupTopics();

document.getElementById("main.form").addEventListener('submit', save);
document.getElementById("story.select").addEventListener('change', loadStoryEvent);
document.getElementById("newtrack").addEventListener('click', newTrack);

