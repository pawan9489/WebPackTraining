import big from '../images/big.jpg';
import small from '../images/small.jpg'
import '../styles/images_viewer.css'

const smallImg = document.createElement('img')
const bigImg = document.createElement('img')

smallImg.src = small
bigImg.src = big

document.body.appendChild(smallImg)
document.body.appendChild(bigImg)
