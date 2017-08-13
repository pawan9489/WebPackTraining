console.log(22);

const btn = document.createElement('button');
btn.innerText = 'ClickMe for Big Picture';
btn.onclick = () => {
    System.import('./image_viewer')
};

document.body.appendChild(btn)

