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

function load() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            editor.setData(JSON.parse(this.responseText).data);
            }
        };
    xhr.open('GET', '/load');
    xhr.send();
}

function save(evt) {
    console.log(evt.target);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

        }
    };
    xhr.open('PUT', '/save');
    xhr.send(JSON.stringify({
        //"topic": document.getElementById("topic").value,
        //"date": document.getElementById("date").value,
        //"text": text,
        "track": parseInt(evt.target.getElement().parentElement.getAttribute('tracknumber')),
        "text": evt.target.getContent()
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
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            populateTopics(JSON.parse(this.responseText));
            }
        }
    xhr.open('GET', '/topics');
    xhr.send();
}

function loadStory() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var container = document.getElementById("story.container");
            while(container.firstChild) {
                container.removeChild(container.firstChild);
            }
            for(var record of JSON.parse(this.responseText)) {
                var track = document.createElement("div")
                track.setAttribute("trackNumber", record[0]);
                track.setAttribute("class", "track");

                var date = document.createElement("h2");
                date.innerHTML = record[1]

                var paragraph = document.createElement("textaera");
                paragraph.setAttribute("id", "content-"+record[0]);
                paragraph.setAttribute("class", "editable");

                paragraph.innerHTML = record[2];

                track.appendChild(date);
                track.appendChild(paragraph);

                container.appendChild(track);
                };
            }
        document.querySelectorAll(".track").forEach(function(e) {
            e.addEventListener('click', function (k){
                if (tinymce.activeEditor) {
                    tinymce.activeEditor.destroy();
                    }

                tinymce.init(editorSetting("#content-"+k.currentTarget.getAttribute("tracknumber")));
                })
            })
        };

    xhr.open('GET', '/story?topic='+this.value);
    xhr.send();

}

console.log("init");
window.editor = null;

setupMenu();
setupTopics();


document.getElementById("main.form").addEventListener('submit', save);
document.getElementById("story.select").addEventListener('change', loadStory);

