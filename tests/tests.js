function tests(){
	this.runAllTests = function(){
		testUCB1();
		testBernoulliArm();
		testGaussianArmStdevLessThan0();
		testGaussianArmStdevAndMean0();
	}

	function testUCB1(){
		var agnts = new agents();
		test("UCB1 test", function(){
			var data = [];
			for(var i=0; i<10; i++){
				data.push({played:1, reward:1});
			}
			var agnts = new agents();
			var ucb1Data = agnts.getScores("UCB", data)
			debugger;
			for(var i=0; i<10; i++){
				equal(ucb1Data[i].y, (i+1)/(i+1)+Math.sqrt((2*Math.log(i+1)/(i+1))));
			}
		});
	}

	function testBernoulliArm(){
		var bndts = new bandits();
		test("bernoulli arm test", function(){
			var b = bndts.getBandit({name:"bernoulli", prob:1});
			equal(b.getReward(), 1);
		});
	}

	function testGaussianArmStdevLessThan0(){
		var bndts = new bandits();
		test("gaussian arm test1", function(){
			var b = bndts.getBandit({name:"gaussian", mean:0, variance:-1});
			equal(0, 0);
		});
	}

	function testGaussianArmStdevAndMean0(){
		var bndts = new bandits();
		test("gaussian arm test1", function(){
			var b = bndts.getBandit({name:"gaussian", mean:0, variance:0});
			equal(b.getReward(), 1);
		});
	}
}