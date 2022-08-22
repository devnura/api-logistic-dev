// GET USERS
const getGroupList = async (trx) => {
  console.log("first")
  let result = await trx
    .select(
      "tmg.c_group_code",
      "tmg.c_group_name",
    )
    .from('public.t_m_group as tmg')
    .orderBy("tmg.c_group_code", "ASC")

  return result;
};

module.exports = {
  getGroupList
};
