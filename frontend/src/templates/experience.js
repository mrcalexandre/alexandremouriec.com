import React from "react"
import Img from "gatsby-image"

const Experience = ({ experience }) => {
  return (
    <tr className="hover:bg-gray-100 hover:shadow-sm">
      <td className="px-6 py-4 whitespace-no-wrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-12 h-12">
            <Img
              fluid={experience.node.logo.childImageSharp.fluid}
              className="w-12 h-12 rounded-full"
            />
          </div>
          <div className="ml-4 mr-3">
            <div className="font-semibold leading-5 text-gray-900 text-md sm:text-sm">
              {experience.node.role}
            </div>
            <div className="font-medium leading-5 text-left text-gray-600 text-md sm:text-sm">
              {experience.node.company}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-no-wrap">
        <div className="hidden font-bold leading-5 text-left text-gray-700 text-md sm:text-xs md:text-xs lg:text-md lg:table-cell">
          {experience.node.description}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-no-wrap">
        <span className="hidden px-4 py-1 font-semibold leading-5 text-teal-800 bg-teal-100 rounded-full sm:text-xs md:text-xs lg:text-md lg:table-cell">
          {experience.node.date}
        </span>
      </td>
    </tr>
  )
}

export default Experience
