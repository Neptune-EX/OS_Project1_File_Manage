/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License,Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ApplicationFileTab } from '../view/ApplicationFileTab';
import { publicFilesTab } from '../view/PublicFilesTab';
import { SmartClassifyTab } from '../view/SmartClassifyTab';
import { KnowledgeTab } from '../view/KnowledgeTab';
import { TrashTab } from '../view/TrashTab';

@Entry
@Component
struct HomePage {
  build() {
    Column() {
      Column() {
        Text($r('app.string.title'))
          .width($r('app.float.default_312'))
          .height($r('app.float.default_41'))
          .textAlign(TextAlign.Start)
          .fontSize($r('app.float.default_30'))
          .fontFamily('HarmonyHeiTi-Bold')
          .fontColor($r('app.color.text_color'))
          .lineHeight($r('app.float.default_41'))
          .fontWeight(700)
          .margin({
            top: $r('app.float.default_7'),
            bottom: $r('app.float.default_8'),
            left: $r('app.float.default_24'),
            right: $r('app.float.default_24')
          })
      }
      .width($r('app.float.default_360'))
      .height($r('app.float.default_56'))

      Tabs() {
        TabContent() {
          ApplicationFileTab()
        }
        .height('100%')
        .tabBar(new SubTabBarStyle($r('app.string.bar1'))
          .indicator({ marginTop: $r('app.float.default_8') })
          .labelStyle({ font: { size: $r('app.float.default_16') } })
        )

        TabContent() {
          Scroll() {
            publicFilesTab()
          }
          .height($r('app.float.default_680'))
        }
        .height('100%')
        .tabBar(new SubTabBarStyle($r('app.string.bar2'))
          .indicator({marginTop : $r('app.float.default_8')})
          .labelStyle({font : {size : $r('app.float.default_16')}})
        )

        // TabContent() {
        //   Scroll() {
        //     DeduplicationTab()
        //   }
        //   .height($r('app.float.default_680'))
        // }
        // .height('100%')
        // .tabBar(new SubTabBarStyle($r('app.string.bar3'))
        //   .indicator({marginTop : $r('app.float.default_8')})
        //   .labelStyle({font : {size : $r('app.float.default_16')}})
        // )

        // TabContent() {
        //   Scroll() {
        //     TrashTab()
        //   }
        //   .height($r('app.float.default_680'))
        // }
        // .height('100%')
        // .tabBar(new SubTabBarStyle($r('app.string.bar4'))
        //   .indicator({marginTop : $r('app.float.default_8')})
        //   .labelStyle({font : {size : $r('app.float.default_16')}})
        // )
        //
        // TabContent() {
        //   Scroll() {
        //     TestDataTab()
        //   }
        //   .height($r('app.float.default_680'))
        // }
        // .height('100%')
        // .tabBar(new SubTabBarStyle($r('app.string.bar5'))
        //   .indicator({marginTop : $r('app.float.default_8')})
        //   .labelStyle({font : {size : $r('app.float.default_16')}})
        // )

        TabContent() {
          Scroll() {
            SmartClassifyTab()
          }
          .height($r('app.float.default_680'))
        }
        .height('100%')
        .tabBar(new SubTabBarStyle($r('app.string.bar6'))
          .indicator({marginTop : $r('app.float.default_8')})
          .labelStyle({font : {size : $r('app.float.default_16')}})
        )

        TabContent() {
          KnowledgeTab()
        }
        .height('100%')
        .tabBar(new SubTabBarStyle($r('app.string.bar7'))
          .indicator({marginTop : $r('app.float.default_8')})
          .labelStyle({font : {size : $r('app.float.default_16')}})
        )

        TabContent() {
          TrashTab()
        }
        .height('100%')
        .tabBar(new SubTabBarStyle('回收站')
          .indicator({marginTop : $r('app.float.default_8')})
          .labelStyle({font : {size : $r('app.float.default_16')}})
        )
      }
      .barWidth($r('app.float.default_360'))
      .barHeight($r('app.float.default_56'))
      .width('100%')
      .layoutWeight(1)
    }
    .backgroundColor($r('app.color.picture_background'))
    .justifyContent(FlexAlign.Start)
    .width('100%')
    .height('100%')
    .padding({ top: $r('app.float.default_48') })
  }
}