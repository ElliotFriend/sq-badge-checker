import React, { useMemo } from 'react'
import { useDropzone } from 'react-dropzone'

/**
 * This component enables drag-n-drop functionality on the /verify page, so a
 * user can drop their verification txt file onto the page, rather than having
 * to copy/paste the text from inside it.
 */
export default function DropBatch(props) {
  const setAddresses = props.setAddresses
  const children = props.children

  // Set the styles that will be present when someone is currently dragging
  const activeStyle = {
    border: '3px dashed var(--bs-primary)',
    padding: '1rem',
    transition: '.24s ease'
  }

  // Configure the dropzone including how many files, what types of files are
  // accepted, disable clicking on the input, and what to do with the file once
  // it's been dropped.
  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    accept: '.txt',
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    onDrop: ([file]) => {
      let reader = new FileReader()
      reader.onload = (e) => {
        let contents = e.target.result
        setAddresses(contents)
      }
      reader.readAsText(file)
    }
  })

  // Add active styles only when necessary.
  const style = useMemo(() => ({
    ...(isDragActive ? activeStyle : {})
  }), [
    isDragActive
  ])

  return (
    <div {...getRootProps({style, className: "dropzone"})}>
      <input {...getInputProps()} />
      {children}
    </div>
  )
}
