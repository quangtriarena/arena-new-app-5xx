export const generateExportName = (resources) => {
  try {
    let desription = ''
    resources.forEach((item) => {
      desription += desription ? ', ' : ''
      desription += `${item.type.value}`
    })
    return desription
  } catch (error) {
    return ''
  }
}

export const generateExportDescriptions = (resources) => {
  try {
    let desription = ''
    resources.forEach((item) => {
      desription += desription ? ', ' : ''
      desription += `${item.type.value} (${item.count.value})`
    })
    return desription
  } catch (error) {
    return ''
  }
}
