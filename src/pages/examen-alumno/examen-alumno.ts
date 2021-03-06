import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController  } from 'ionic-angular';
import { ExamenServiceProvider } from '../../providers/examen-service/examen-service';

import { TimerPage } from '../timer/timer'

//borrar data fake
import { DataExamenAlumno } from './data-examen-alumno'

@IonicPage()
@Component({
  selector: 'page-examen-alumno',
  templateUrl: 'examen-alumno.html',
})
export class ExamenAlumnoPage {

	@ViewChild(TimerPage) timer: TimerPage;

	duracionExamen: number = 0;
	inicioExamen;
	finExamen;
	endExamen = false; //variable para indicar que el usuario decidio terminar el examen
	dataExamenAlumno = new DataExamenAlumno();
	//variables globales
	partExamen = 'Inicio';
	examenPendingCurrent = {
		id: null,
		name: '',
		subject: '',
		correct_points: null,
		error_points: null,
		attempts_allowed: null,
		start_datetime: '',
		end_datetime:'',
		duration_time: null
	};

	nota = 0;

	//variables para el inicio
	examen = 'exam-pendiente';
	exam_pendientes = [];
	exam_pasados = [];
	respuestas = [];

	//variables para las preguntas
	nameMyexam = '';
	preguntas = [];
	answerA = 0;
	answerB = 0;
	answerC = 0;
	answerD = 0;
	answerE = 0;

	//variables para el resultado
	constructor(public navCtrl: NavController, 
		public navParams: NavParams,
		public examenServiceProvider: ExamenServiceProvider,
		private alertCtrl: AlertController) {
	}

	ionViewDidLoad() {
	    console.log('Inicializando ExamenAlumnoPage');

	}

	ionViewWillEnter(){

		let res = this.examenServiceProvider.getListExam();

	    res.subscribe(
	      value => {
	        if (value.success){
	        	this.exam_pendientes = value.data;
	        }else{
	        	console.log('No se ha podido recuperar los examenes pendientes del alumno.');
	        }
	      },
	      err => {console.log('Error: ' + err)},//CONTROLAMOS LOS ERRORES
	      () => console.log('this is the end')
	    );
	}

	//FUNCIONES PARA VISTA DE EXAMENES
	irExamen(){

		this.partExamen = 'Inicio';
	}
	//FUNCIONES PARA RENDIR EXAMEN

	rendirExamen($id){
		//INI: 0
		//Establacemos el examen pendiente actual y su duraccion
		let message = 'El examen durará: ';
		let duracion;
		let examenCurrent = this.examenPendingCurrent;
		let respuestasCurrent = [];
		this.exam_pendientes.forEach(function (elemento, indice, array) {
    		if (elemento.id == $id){
				examenCurrent = elemento;
				return;
    		};
		});
    	this.examenPendingCurrent = examenCurrent;
    	duracion = examenCurrent.duration_time;
		message = message.concat(this.getMinute(examenCurrent.duration_time),' minutos');
		//END 0

		//INI: 1
		//recuperamos las preguntas para el examen que se va rendir
		let res = this.examenServiceProvider.getAlternative($id);
		
	    res.subscribe(
	      value => {
	        if(value.success){
	        	this.preguntas = value.data;
	        	console.log('xx');
	        }else{
	        	console.log('No se ha podido recuperar las preguntas para este examen');
	        }
	      },
	      err => {console.log('Error: ' + err)},//CONTROLAMOS LOS ERRORES
	      () => console.log('this is the end')
	    );
	    //END: 1

		//INI: 2
		//pedimos confirmacion para que inicie el examen y iniciamos caontador si es el caso
		let alert = this.alertCtrl.create({
	    	title: 'Rendir Examen',
	    	message: message,
	    	buttons: [
	      	{
	        	text: 'Cancelar',
	        	role: 'cancel',
	        	handler: () => {
	          		console.log('Se cancelo el inicio de la prueba.');
	        	}
	      	},
	      	{
	        	text: 'Ir a la prueba',
	        	handler: () => {
			        this.inicioExamen = new Date();
					this.respuestas = [];
					//INI: 2.1
					//construimos el tipo de dato para calcular la nota
					this.preguntas.forEach(function (elemento, indice, array) {
			    		respuestasCurrent.push({'id': elemento.id, 'answer':elemento.answer, 
			    			'a': 0, 
			    			'b': 0, 
			    			'c': 0,
			    			'd': 0,
			    			'e': 0,
			    			'correct': 0,
			    			'error':0
			    		}); 
			    		return;
					});
			    	this.respuestas = respuestasCurrent;
					//END: 2.1					

					this.partExamen = 'Preguntas';
					this.duracionExamen=duracion;
			        console.log(4);
			        setTimeout((result) => {
			        	//inicia el contador del examen
			            this.timer.startTimer();
			            this.finalizo();//vemos si acabo el timer
			        }, 1000);
	        	}
	      	}
	    	
	    	]
	  	});
	  	alert.present();
	  	//END 2

	}

	finalizo(){
		setTimeout(() => {
			if (!this.timer.hasFinished() && !this.endExamen ) {
				this.finalizo();
			}
			else {
				console.log('fin examen');
				this.finExamen = new Date();

				if(!this.endExamen){
					const alert01 = this.alertCtrl.create({
				    	title: 'Termino el Examen!',
				    	subTitle: 'Puedes consultar tus notas!',
				    	buttons: ['OK']
				    });
					
					alert01.present();
				}
				this.calcularNota(this.examenPendingCurrent.correct_points,this.examenPendingCurrent.error_points);
				this.partExamen = 'Resultados';
				this.endExamen = false;
				}
		}, 1000)
	}



	updateChoice(id, choice){
		this.respuestas.forEach(function (elemento, indice, array) {
    		if (elemento.id == id){
				switch(choice){
					case 'a':
						elemento.a = (elemento.a == 1 ? 0 : 1);
						break;
					case 'b':
						elemento.b = (elemento.b == 1 ? 0 : 1);
						break;
					case 'c':
						elemento.c = (elemento.c == 1 ? 0 : 1);
						break;
					case 'd':
						elemento.d = (elemento.d == 1 ? 0 : 1);
						break;
					case 'e':
						elemento.e = (elemento.e == 1 ? 0 : 1);
						break;
				}
				return;
    		};
		});
	}

	calcularNota(ptos_favor, ptos_contra){

		let ptos_favor_calc = 0;
		let ptos_contra_calc = 0;

		this.respuestas.forEach(function (elemento, indice, array) {

			let respuesta_correcta = elemento.answer.toString(2).padStart(5,'0');//convertir answer a binario mas lpad
			let ptos_divididos_f = ptos_favor/(respuesta_correcta.split('1').length-1);//contar cantidad de respuestas correctas que se deberia tener
			let ptos_divididos_c = ptos_contra/(respuesta_correcta.split('1').length-1);//contar cantidad de respuestas correctas que se deberia tener
			let total_correctas = 0;
			let total_incorrectas = 0;
			//comprobar equivocados
			if(elemento.a == 1){
				total_incorrectas = total_incorrectas +  (respuesta_correcta[0] != 1 ? 1 : 0);
			}
			if(elemento.b == 1){
				total_incorrectas = total_incorrectas +  (respuesta_correcta[1] != 1 ? 1 : 0);
			}
			if(elemento.c == 1){
				total_incorrectas = total_incorrectas +  (respuesta_correcta[2] != 1 ? 1 : 0);
			}
			if(elemento.d == 1){
				total_incorrectas = total_incorrectas +  (respuesta_correcta[3] != 1 ? 1 : 0);
			}
			if(elemento.e == 1){
				total_incorrectas = total_incorrectas +  (respuesta_correcta[4] != 1 ? 1 : 0);
			}
			//comprobar aciertos
			if( respuesta_correcta[0] == 1){
				total_correctas = total_correctas +  (elemento.a == 1? 1 : 0);
			}
			if( respuesta_correcta[1] == 1){
				total_correctas = total_correctas +  (elemento.b == 1 ? 1 : 0);
			}
			if( respuesta_correcta[2] == 1){
				total_correctas = total_correctas +  (elemento.c == 1 ? 1 : 0);
			}
			if( respuesta_correcta[3] == 1){
				total_correctas = total_correctas +  (elemento.d == 1 ? 1 : 0);
			}
			if( respuesta_correcta[4] == 1){
				total_correctas = total_correctas +  (elemento.e == 1 ? 1 : 0);
			}

			elemento.correct = total_correctas*ptos_divididos_f;
			elemento.error = total_incorrectas*ptos_divididos_c;

			ptos_favor_calc += total_correctas*ptos_divididos_f;
			ptos_contra_calc += total_incorrectas*ptos_divididos_c;


		});
		console.log(this.respuestas);
		this.nota = (ptos_favor_calc - ptos_contra_calc);
		return;
	}

	//FUNCIONES PARA VER RESULTADDOS
	verResultados(){
		let alert = this.alertCtrl.create({
	    	title: 'Confirmar',
	    	message: 'Seguro que desesa terminar el examen?',
	    	buttons: [
	      	{
	        	text: 'Cancelar',
	        	role: 'cancel',
	        	handler: () => {
	          		console.log('Cancel clicked');
	        	}
	      	},
	      	{
	        	text: 'Seguro',
	        	handler: () => {
					this.endExamen = true;
	          		console.log('Ver resultados');
	          		console.log(this.respuestas);
	        	}
	      	}
	    			]
	  	});
	  	alert.present();		
		
	}

	//FORMATEO FECHAS

	getTime(inputSeconds: number) {
		var sec_num = parseInt(inputSeconds.toString(), 10);
		var hours = Math.floor(sec_num / 3600);
		var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		var seconds = sec_num - (hours * 3600) - (minutes * 60);
		return this.addo(hours) + ":" + this.addo(minutes) + ":" + this.addo(seconds);
	}
  
  	getFecha(horadia) {
    	let format = new Date(horadia);
    	return this.addo(format.getUTCFullYear()) + "-" + this.addo(format.getUTCMonth()) + "-" + this.addo(format.getUTCDate());
	}
	getMinute(inputSeconds: number) {
		var sec_num = parseInt(inputSeconds.toString(), 10);
		var minutes = Math.floor(sec_num / 60);
		var seconds = sec_num - (minutes * 60);
		return this.addo(minutes) + ":" + this.addo(seconds);
	}
  

  	addo(comp) {
    	return (((comp + "").length == 1) ? "0" + comp : comp);
 	}






}