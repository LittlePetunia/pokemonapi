var pk_damage=[];

var delay = ( function() {
    var timer = 0;
    return function(callback, ms) {
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();

function submit(){
	pk_damage=[]; //clean the array when enter new inputs
	var pk1 = document.getElementById("pk1").value;
	var pk2 = document.getElementById("pk2").value;

	if(!pk1 || !pk2){ //no inputs
		new PNotify({
	        title: "Input",
	        text: "Please Enter Pokemon's name or id",
	        type: "warning",
	        delay: 600
	      })
	}
	else if(pk1==pk2){ //inputs with same value
		new PNotify({
	        title: "Input",
	        text: "These two inputs point to the same Pokemon!",
	        type: "warning",
	        delay: 600
	      })
	}


	pk_result(pk1);
	pk_result(pk2);

	delay(function(){
		var to_write = document.getElementById('winner');
    	var res = check_win();

    	if (res['pk1']>res['pk2']){
    		//pk1 has higher type points
    		to_write.innerHTML=pk_damage[0]['name'];
    	}
    	else if(res['pk1']<res['pk2']){
    		//pk2 has higher type points
    		to_write.innerHTML=pk_damage[1]['name'];
    	}
    	else{
    		//same type points, check base stats
    		var s1=check_stats(pk_damage[0]['stats'])
    		var s2=check_stats(pk_damage[1]['stats'])
    		if(s1>s2){
    			//pk1 higher base stat
    			to_write.innerHTML=pk_damage[0]['name'];
    		}
    		else if(s2>s1){
    			//pk2 higher base stat
    			to_write.innerHTML=pk_damage[1]['name'];
    		}
    		else{
    			//same base stat, return pk1
    			to_write.innerHTML=pk_damage[0]['name'];
    		}
    	}




	}, 5000 ); 
	
	
}



function pk_result(pk){
	//get damages relations for each pk
	var name='';
	var url = 'https://pokeapi.co/api/v2/pokemon/'+pk+'/';
	$.ajax({
    url: url,
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    success: function(result) {
    	var pk_types = result['types'];
    	var stats = result['stats'];
    	name = result['name']
    	for(var i=0;i<pk_types.length;i++){
    		var double_damage_from=[]
    		var double_damage_to=[]
    		var half_damage_to=[]
    		var half_damage_from=[]
    		var no_damage_from=[]
    		var no_damage_to=[]
    			$.ajax({
				    url: pk_types[i]['type']['url'],
				    type: 'GET',
				    contentType: 'application/json; charset=utf-8',
				    success: function(result) {
				    	double_damage_from.push.apply(double_damage_from,get_names(result['damage_relations']['double_damage_from']));
				    	double_damage_to.push.apply(double_damage_to,get_names(result['damage_relations']['double_damage_to']));
				    	half_damage_to.push.apply(half_damage_to,get_names(result['damage_relations']['half_damage_to']));
				    	half_damage_from.push.apply(half_damage_from,get_names(result['damage_relations']['half_damage_from']));
				    	no_damage_from.push.apply(no_damage_from,get_names(result['damage_relations']['no_damage_from']));
				    	no_damage_to.push.apply(no_damage_to,get_names(result['damage_relations']['no_damage_to']));
				    }
				});
    		
    	}


    	pk_damage.push({'name':name,'type':pk_types,'stats':stats,'double_damage_from':double_damage_from,'double_damage_to':double_damage_to,
    		'half_damage_to':half_damage_to,'half_damage_from':half_damage_from,'no_damage_from':no_damage_from,'no_damage_to':no_damage_to});	
    	},
    	error: function (jqXHR, status, err) {
    		//no record for input pk
		    new PNotify({
	        title: status,
	        text: pk+' '+ jqXHR['responseJSON'].detail,
	        type: "error",
	        delay: 600
	      })
		 },
	});

}

function get_names(obj){
	var result=[]
	for(var k=0; k<obj.length;k++){
		result.push(obj[k].name)
	}
	return result
}


function check_win(){
	typeone = pk_damage[0]['type']
	typetwo = pk_damage[1]['type']
    var counter_one=0;
	var counter_sed=0;

	for(var i=0;i<typeone.length;i++){
		if(pk_damage[1]['double_damage_from'].indexOf(typeone[i].type.name)!=-1){
			//pk1 make double damage to pk2
			counter_one++
		}

		if(pk_damage[1]['double_damage_to'].indexOf(typeone[i].type.name)!=-1){
			//pk2 make double damage to pk1
			counter_sed++
		}

		if(pk_damage[1]['half_damage_from'].indexOf(typeone[i].type.name)!=-1){
			//pk1 make only half damage to pk2
			counter_sed++
		}

		if(pk_damage[1]['half_damage_to'].indexOf(typeone[i].type.name)!=-1){
			//pk2 make only half damage to pk1
			counter_one++
		}

		if(pk_damage[1]['no_damage_to'].indexOf(typeone[i].type.name)!=-1){
			//pk2 make no damage to pk1
			counter_one++
		}
		if(pk_damage[1]['no_damage_from'].indexOf(typeone[i].type.name)!=-1){
			//pk1 make no damage to pk2
			counter_sed++
		}



	}

	for(var j=0;j<typetwo.length;j++){
		if(pk_damage[0]['double_damage_from'].indexOf(typetwo[j].type.name)!=-1){
			//pk2 make double damage to pk1
			counter_sed++
		}

		if(pk_damage[0]['double_damage_to'].indexOf(typetwo[j].type.name)!=-1){
			//pk1 make double damage to pk2
			counter_one++
		}

		if(pk_damage[0]['half_damage_from'].indexOf(typetwo[j].type.name)!=-1){
			//pk2 make only half damage to pk1
			counter_one++
		}

		if(pk_damage[0]['half_damage_to'].indexOf(typetwo[j].type.name)!=-1){
			//pk1 make only half damage to pk2
			counter_sed++
		}

		if(pk_damage[0]['no_damage_from'].indexOf(typetwo[j].type.name)!=-1){
			//pk2 make no damage to pk1
			counter_one++
		}

		if(pk_damage[0]['no_damage_to'].indexOf(typetwo[j].type.name)!=-1){
			//pk1 make no damage to pk2
			counter_sed++
		}

	}
	return {'pk1':counter_one,'pk2':counter_sed}

}


function check_stats(stats){
	var res=0;
	for(var i=0;i<stats.length;i++){
		res+=stats[i]['base_stat']
	}
	return res
}