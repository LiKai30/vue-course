<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <div id="main" style="height:400px;width:700px;"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash'
export default {
  data() {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: "用户来源"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3"
            }
          }
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: "value"
          }
        ]
      }
    }
  },
  created() {},
  //   此时dom已经初始化完毕
  async mounted() {
    var myChart = echarts.init(document.querySelector("#main"))
    const { data: res } = await this.$http.get("reports/type/1")
    if (res.meta.status !== 200) {
      return this.$message.error("获取数据失败!")
    }
    //将获取的数据和options对象数据合并
    const option = _.merge(res.data, this.options)


    myChart.setOption(option)
  },
  methods: {}
}
</script>

<style lang="less" scoped>
</style>