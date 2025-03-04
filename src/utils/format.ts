import icon01 from '@/assets/images/icon_right_menue_1.png'
import icon05 from '@/assets/images/icon_right_menue_5.png'
import icon08 from '@/assets/images/icon_right_menue_8.png'
import icon10 from '@/assets/images/icon_right_menue_10.png'

/** 格式化icon */
const formatIcon = (item) => {
  if (item.name === 'CCImageGenerator') {
    return icon05
  } else if (item.name === 'CCPromptGenerator') {
    return icon10
  } else if (item.name === 'CCPromptInput') {
    return icon01
  } else if (item.name === 'CCRemoveBG') {
    return icon08
  } else {
    return item.icon
  }
}

export default formatIcon
