function setFieldDisabled(fieldId) {
    var enabled = document.getElementById(fieldId+'-enabled');

    if (enabled.checked === true){
      document.getElementById(fieldId).disabled = false;
    } else {
        document.getElementById(fieldId).disabled = true
    }
  }

function showAdvanced(){
    const showAdvanced = document.getElementById('showAdvanced');
    const advanced = document.getElementsByClassName('advanced');
    let displayProperty = 'none';
    if (showAdvanced.innerHTML === "Show advanced settings") {
        showAdvanced.innerHTML = "Hide advanced settings";
        displayProperty = 'block';
    } else {
        showAdvanced.innerHTML = "Show advanced settings"
    }
    for (var i = 0; i < advanced.length; i ++) {
        advanced[i].style.display = displayProperty;
    }
}
