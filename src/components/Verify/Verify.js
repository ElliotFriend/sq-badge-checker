import './Verify.css';
import React from 'react';
import { useParams } from 'react-router-dom'

export default function Verify() {
  let { slug } = useParams()
  return (
    <div>
      <p>Here to verify {slug}</p>
    </div>
  )
}
