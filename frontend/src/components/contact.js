import React from "react"
import "../assets/css/main.css"

export default function Contact() {
  return (
    <div className="container px-5 pb-8 mx-auto">
      <div className="flex flex-col w-full mb-6 text-center">
        <h1
          className="mt-12 text-3xl font-extrabold leading-10 tracking-tight text-center text-gray-900 lg:text-4xl sm:leading-none"
          id="contact"
        >
          Contact Me
        </h1>
      </div>
      <div className="mx-auto lg:w-1/2 md:w-2/3">
        <form
          className="flex flex-wrap -m-2"
          method="post"
          action="https://formspree.io/f/xvovrbod"
        >
          <div className="w-full p-3 lg:w-1/2" data-children-count="1">
            <input
              type="text"
              placeholder="Name"
              name="name"
              className="block w-full px-3 py-3 mt-1 transition duration-150 ease-in-out border border-gray-300 rounded-md shadow-sm form-input focus:outline-none focus:shadow-outline-teal focus:border-teal-400 sm:text-sm sm:leading-5"
            />
          </div>
          <div className="w-full p-3 lg:w-1/2" data-children-count="1">
            <input
              type="email"
              placeholder="Email"
              name="_replyto"
              className="block w-full px-3 py-3 mt-1 transition duration-150 ease-in-out border border-gray-300 rounded-md shadow-sm form-input focus:outline-none focus:shadow-outline-teal focus:border-teal-400 sm:text-sm sm:leading-5"
            />
          </div>
          <div className="w-full p-3" data-children-count="1">
            <textarea
              rows="8"
              name="message"
              className="block w-full px-3 py-3 mt-1 transition duration-150 ease-in-out border border-gray-300 rounded-md shadow-sm form-textarea focus:outline-none focus:shadow-outline-teal focus:border-teal-400 sm:text-sm sm:leading-5"
              placeholder="Write your message here ..."
            ></textarea>
          </div>
          <div className="flex justify-center w-full p-3">
            <input
              type="submit"
              value="Send"
              className="flex justify-center px-24 py-2 text-lg font-bold text-white transition duration-150 ease-in-out bg-teal-400 border border-transparent rounded-lg shadow-lg cursor-pointer hover:bg-teal-300 focus:outline-none focus:border-teal-400 focus:shadow-outline-teal"
            ></input>
          </div>
        </form>
      </div>
    </div>
  )
}
