import { type Plugins } from 'plugins/types'
import { RouteCategory } from 'Routes/helpers'
import { JinxIcon } from 'components/Icons/JinxIcon'

import { JinxPage } from './jinxPage'

// eslint-disable-next-line import/no-default-export
export default function register(): Plugins {
  return [
    [
      'jinxPage',
      {
        name: 'jinxPage',
        icon: <JinxIcon />,
        routes: [
          {
            path: '/jinx',
            label: 'navBar.jinxToken',
            main: () => <JinxPage />,
            icon: <JinxIcon />,
            category: RouteCategory.Explore,
            hide: true,
            routes: [
              {
                path: '/jinx',
                label: 'navBar.jinxToken',
                main: () => <JinxPage />,
              },
              {
                path: '/jinxy',
                label: 'navBar.jinxToken',
                main: () => <JinxPage />,
              },
            ],
          },
        ],
      },
    ],
  ]
}
