本部分为我尝试使用Rust写leetcode的心得与部分题解。

虽然我在毕设中接触了Rust，并切身感受了Rust的优越性，但是我在秋招时刷题的语言主要是C++，因此我考虑使用Rust刷题，通过做题来比较二者之间的优劣并复习算法保持手感。

 
# 1.两数之和
[1. 两数之和 - 力扣（LeetCode）](https://leetcode.cn/problems/two-sum/description/)

- `2 <= nums.length <= 104`
- `-109 <= nums[i] <= 109`
- `-109 <= target <= 109`

两数之和的思路很简单，同时数据量不大，通过构造哈希表查询即可在O(n)的时间复杂度解决。
在遍历过程中，将遇见的下标与数在哈希表中查询，并将未出现的元组插入哈希表中，一趟遍历即可解决。
```rust
pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {

    let mut hash_table = HashMap::new();

    for (i, val) in nums.iter().enumerate() {

        if let Some(val) = hash_table.get(&(target - val)) {

            return vec![i as i32, *val as i32];

        } else {

            hash_table.insert(val, i);

        }

    }

    vec![]

}
```