console.log("loaded");

function setupEditor() {
    ClassicEditor
    .create( document.querySelector( '#editor' ) )
    .then( editor => {
        console.log( editor );
        window.editor = editor;

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log(this.responseText);
                editor.setData(JSON.parse(this.responseText).data);
                }
            };
        xhr.open('GET', '/load');
        xhr.send();
    } )
    .catch( error => {
        console.error( error );
    } );
}

function save(evt) {
    const text = editor.getData();

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        populateTopics();
        }
    };
    xhr.open('POST', '/save');
    xhr.send(JSON.stringify({
        "topic": document.getElementById("topic").value,
        "date": document.getElementById("date").value,
        "text": text
        }));

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
                var paragraph = document.createElement("p");
                paragraph.innerHTML="<h3>"+record[0]+"</h3>\n<p>"+record[1]+"</p>\n";
                container.appendChild(paragraph)
                };
            }
        }
    xhr.open('GET', '/story?topic='+this.value);
    xhr.send();
}

console.log("init");

setupMenu();
setupEditor();
setupTopics();


document.getElementById("save").addEventListener('click', save);
document.getElementById("story.select").addEventListener('change', loadStory);

