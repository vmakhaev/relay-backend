export default 'query RootQuery{viewer{id,..._0169e2f50}} fragment _3b5c8a9f9 on Todo{id} fragment _4fff622b2 on Todo{complete,id} fragment _52814a2ea on Todo{id} fragment _2622a29a1 on Todo{complete,id,text,..._3b5c8a9f9,..._4fff622b2,..._52814a2ea} fragment _68b422443 on TodoConnection{edges{node{complete,id},cursor},totalCount} fragment _1c17caf08 on TodoConnection{completedCount,edges{node{complete,id,..._2622a29a1},cursor},totalCount,..._68b422443} fragment _81f3f32d5 on TodoConnection{completedCount,edges{node{complete,id},cursor},totalCount} fragment _75ca0a41b on TodoConnection{completedCount,edges{node{complete,id},cursor},totalCount,..._81f3f32d5} fragment _9c8ddb28d on User{id,todos{totalCount}} fragment _b3c60fe83 on User{id} fragment _da1bcf590 on User{id,todos{completedCount}} fragment _e765e75c8 on User{id,todos{completedCount,totalCount}} fragment _ceb827edb on User{id,..._da1bcf590,..._e765e75c8} fragment _a9f36782a on User{id,..._b3c60fe83,..._ceb827edb} fragment _g2ea7339 on User{id} fragment _fd508f361 on User{id,..._g2ea7339} fragment _0169e2f50 on User{_todosc94f0551:todos(first:9007199254740991){edges{node{id},cursor},totalCount,pageInfo{hasNextPage,hasPreviousPage},..._1c17caf08,..._75ca0a41b},id,..._9c8ddb28d,..._a9f36782a,..._fd508f361}';
