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
console.log("init");

setupMenu();
setupEditor();
setupTopics();


document.getElementById("save").addEventListener('click', save);

